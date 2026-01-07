import { Router, Request, Response } from 'express';
import { MessageRepositoryInterface } from '../../../application/repositories/MessageRepositoryInterface';
import { NotificationRepositoryInterface } from '../../../application/repositories/NotificationRepositoryInterface';
import { requireAuth } from '../middlewares/auth';
import { requireMessageAccess, requireCanSendMessage, filterUserMessages } from '../middlewares/messageAuth';
import { MessageEntity } from '../../../domain/entities/MessageEntity';
import { UserRepositoryInMemory } from '../../repositories/in-memory/UserRepositoryInMemory';
import { NotificationRepositoryInMemory } from '../../repositories/in-memory/NotificationRepositoryInMemory';
import { AssignMessageToAdvisorUseCase } from '../../../application/use-cases/messaging/AssignMessageToAdvisorUseCase';
import { TransferConversationUseCase } from '../../../application/use-cases/messaging/TransferConversationUseCase';

export class MessageController {
  private router: Router;
  private assignMessageUseCase: AssignMessageToAdvisorUseCase;
  private transferConversationUseCase: TransferConversationUseCase;
  private userRepository: UserRepositoryInMemory;
  private notificationRepository: NotificationRepositoryInterface;

  constructor(
    private messageRepository: MessageRepositoryInterface,
    notificationRepository?: NotificationRepositoryInterface
  ) {
    this.router = Router();
    this.userRepository = new UserRepositoryInMemory();
    this.notificationRepository = notificationRepository || new NotificationRepositoryInMemory();
    this.assignMessageUseCase = new AssignMessageToAdvisorUseCase(messageRepository, this.userRepository);
    this.transferConversationUseCase = new TransferConversationUseCase(
      messageRepository,
      this.userRepository,
      this.notificationRepository
    );
    this.setupRoutes();
  }

  private toMessageDto(message: any): any {
    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      message: message.message,
      date: message.date?.toISOString() || new Date().toISOString(),
    };
  }

  private toMessageDtoArray(messages: any[]): any[] {
    return messages.map(m => this.toMessageDto(m));
  }

  private setupRoutes(): void {
    // GET /api/messages/unassigned - Récupère les messages non assignés (conseillers uniquement)
    // IMPORTANT: Cette route doit être AVANT /:id pour éviter que "unassigned" soit interprété comme un ID
    this.router.get('/unassigned', requireAuth, async (req: Request, res: Response) => {
      try {
        const userRole = (req as any).userRole;
        
        if (userRole !== 'ADVISE') {
          return res.status(403).json({ error: 'Accès interdit' });
        }

        const messages = await this.messageRepository.findUnassignedMessages();
        res.json(this.toMessageDtoArray(messages));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la récupération des messages non assignés',
          details: error.message 
        });
      }
    });

    // GET /api/messages - Liste les messages de l'utilisateur authentifié
    this.router.get('/', requireAuth, filterUserMessages, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        
        // Récupérer les messages envoyés et reçus par l'utilisateur
        const sentMessages = await this.messageRepository.findBySenderId(userId);
        const receivedMessages = await this.messageRepository.findByReceiverId(userId);
        
        // Combiner les deux listes
        const allMessages = [...sentMessages, ...receivedMessages];
        
        // Dédoublonner par ID
        const uniqueMessages = Array.from(
          new Map(allMessages.map(m => [m.id, m])).values()
        );
        
        // Trier par date croissante (plus anciens en premier, plus récents en bas)
        uniqueMessages.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        console.log(`📨 [MessageController] Messages pour user ${userId} (${userRole}):`, uniqueMessages.length);
        uniqueMessages.forEach(m => {
          console.log(`  - Message ${m.id}: de ${m.senderId} vers ${m.receiverId} - "${m.message.substring(0, 30)}..."`);
        });
        
        res.json(this.toMessageDtoArray(uniqueMessages));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
      }
    });

    // GET /api/messages/:id - Récupère un message par ID (seulement si propriétaire)
    this.router.get('/:id', requireAuth, requireMessageAccess(this.messageRepository), async (req: Request, res: Response) => {
      try {
        const message = (req as any).message;
        res.json(this.toMessageDto(message));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du message' });
      }
    });

    // POST /api/messages - Créer un nouveau message
    this.router.post('/', requireAuth, requireCanSendMessage(), async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { receiverId, message } = req.body;

        if (!message) {
          return res.status(400).json({ 
            error: 'Données invalides',
            message: 'Le champ message est requis'
          });
        }

        if (typeof message !== 'string' || message.trim().length === 0) {
          return res.status(400).json({ error: 'Le message ne peut pas être vide' });
        }

        let finalReceiverId: number;

        // Si c'est un client, trouver son conseiller attitré ou mettre receiverId à 1 (premier conseiller par défaut)
        if (userRole === 'CLIENT') {
          // Trouver le conseiller du client
          const client = await this.userRepository.findById(userId);
          if (client && !(client instanceof Error) && client.advisorId) {
            finalReceiverId = client.advisorId;
          } else {
            // Par défaut, envoyer au premier conseiller disponible (ID 1)
            finalReceiverId = 1;
          }
        } else {
          // Pour les conseillers, receiverId est requis
          if (!receiverId) {
            return res.status(400).json({ error: 'receiverId est requis pour les conseillers' });
          }
          const receiverIdNum = parseInt(receiverId);
          if (isNaN(receiverIdNum)) {
            return res.status(400).json({ error: 'receiverId doit être un nombre' });
          }
          finalReceiverId = receiverIdNum;
        }

        // Créer le message
        const messageId = Date.now();
        const newMessage = MessageEntity.create(messageId, userId, finalReceiverId, message.trim());
        await this.messageRepository.save(newMessage);
        
        res.status(201).json(this.toMessageDto(newMessage));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la création du message',
          details: error.message 
        });
      }
    });

    // POST /api/messages/:id/assign - Assigner un message à un conseiller
    this.router.post('/:id/assign', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const messageId = parseInt(req.params.id);

        if (userRole !== 'ADVISE') {
          return res.status(403).json({ error: 'Seuls les conseillers peuvent assigner des messages' });
        }

        const message = await this.messageRepository.findById(messageId);
        if (!message) {
          return res.status(404).json({ error: 'Message non trouvé' });
        }

        // Mettre à jour le receiverId du message original pour qu'il pointe vers le conseiller
        const updatedMessage = MessageEntity.create(
          message.id,
          message.senderId,
          userId, // Le conseiller devient le receiver
          message.message,
          message.date
        );
        await this.messageRepository.update(updatedMessage);

        // Assigner le message au conseiller dans le mapping
        if ('assignAdvisor' in this.messageRepository) {
          await (this.messageRepository as any).assignAdvisor(messageId, userId);
        }

        // Créer un message de réponse automatique pour le client
        const responseMessage = MessageEntity.create(
          Date.now(),
          userId,
          message.senderId,
          `Bonjour, je prends en charge votre demande. Comment puis-je vous aider ?`
        );
        await this.messageRepository.save(responseMessage);

        res.json({ message: 'Message assigné avec succès' });
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de l\'assignation du message',
          details: error.message 
        });
      }
    });

    // POST /api/messages/transfer - Transférer une conversation à un autre conseiller
    this.router.post('/transfer', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { clientId, toAdviserId } = req.body;

        // Seuls les conseillers peuvent transférer des conversations
        if (userRole !== 'ADVISE') {
          return res.status(403).json({ 
            error: 'Accès interdit',
            message: 'Seuls les conseillers peuvent transférer des conversations'
          });
        }

        // Validation des paramètres
        if (!clientId || !toAdviserId) {
          return res.status(400).json({
            error: 'Paramètres manquants',
            message: 'Les champs clientId et toAdviserId sont requis'
          });
        }

        const clientIdNum = parseInt(clientId);
        const toAdviserIdNum = parseInt(toAdviserId);

        if (isNaN(clientIdNum) || isNaN(toAdviserIdNum)) {
          return res.status(400).json({
            error: 'Paramètres invalides',
            message: 'clientId et toAdviserId doivent être des nombres'
          });
        }

        // Transférer la conversation
        const result = await this.transferConversationUseCase.execute(
          clientIdNum,
          userId, // fromAdviserId (l'utilisateur actuel)
          toAdviserIdNum
        );

        if (result instanceof Error) {
          return res.status(400).json({ error: result.message });
        }

        res.json(result);
      } catch (error: any) {
        console.error('Erreur lors du transfert de la conversation:', error);
        res.status(500).json({
          error: 'Erreur lors du transfert de la conversation',
          details: error.message
        });
      }
    });

    // DELETE /api/messages/:id - Supprimer un message (seulement si propriétaire)
    this.router.delete('/:id', requireAuth, requireMessageAccess(this.messageRepository), async (req: Request, res: Response) => {
      try {
        const messageId = parseInt(req.params.id);
        await this.messageRepository.delete(messageId);
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la suppression du message',
          details: error.message 
        });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
