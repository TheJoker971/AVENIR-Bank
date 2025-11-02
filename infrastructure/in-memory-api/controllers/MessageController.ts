import { Router, Request, Response } from 'express';
import { MessageRepositoryInterface } from '../../../application/repositories/MessageRepositoryInterface';
import { requireAuth } from '../middlewares/auth';
import { requireMessageAccess, requireCanSendMessage, filterUserMessages } from '../middlewares/messageAuth';
import { MessageEntity } from '../../../domain/entities/MessageEntity';
import { UserRepositoryInMemory } from '../../repositories/in-memory/UserRepositoryInMemory';
import { AssignMessageToAdvisorUseCase } from '../../../application/use-cases/messaging/AssignMessageToAdvisorUseCase';

export class MessageController {
  private router: Router;
  private assignMessageUseCase: AssignMessageToAdvisorUseCase;
  private userRepository: UserRepositoryInMemory;

  constructor(private messageRepository: MessageRepositoryInterface) {
    this.router = Router();
    this.userRepository = new UserRepositoryInMemory();
    this.assignMessageUseCase = new AssignMessageToAdvisorUseCase(messageRepository, this.userRepository);
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
    // GET /api/messages - Liste les messages de l'utilisateur authentifié
    this.router.get('/', requireAuth, filterUserMessages, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        
        // Récupérer les messages envoyés et reçus par l'utilisateur
        const sentMessages = await this.messageRepository.findBySenderId(userId);
        const receivedMessages = await this.messageRepository.findByReceiverId(userId);
        
        // Combiner les deux listes et dédoublonner si nécessaire
        const allMessages = [...sentMessages, ...receivedMessages];
        
        // Pour les clients, ne montrer que les messages avec leur conseiller attitré
        // Pour les conseillers, montrer tous les messages
        let filteredMessages = allMessages;
        
        if (userRole === 'CLIENT') {
          // Trouver le conseiller attitré du client
          // Un conseiller est attitré si un message a été assigné avec receiverId = advisorId
          const advisorMessages = await this.messageRepository.findByReceiverId(userId);
          const clientSentMessages = await this.messageRepository.findBySenderId(userId);
          
          // Trouver les conseillers qui ont répondu ou ont été assignés
          const advisorIds = new Set<number>();
          for (const msg of clientSentMessages) {
            if (msg.receiverId !== 0) {
              const receiver = await this.userRepository.findById(msg.receiverId);
              if (receiver && !(receiver instanceof Error) && receiver.role.value === 'ADVISE') {
                // Vérifier si ce conseiller a été assigné
                if ('findByAdvisorId' in this.messageRepository) {
                  const assignedMessages = await (this.messageRepository as any).findByAdvisorId(msg.receiverId);
                  if (assignedMessages.some((m: any) => m.senderId === userId)) {
                    advisorIds.add(msg.receiverId);
                  }
                }
              }
            }
          }
          
          // Si le client a un conseiller attitré, ne montrer que les messages avec lui
          if (advisorIds.size > 0) {
            const firstAdvisorId = Array.from(advisorIds)[0];
            filteredMessages = allMessages.filter(m => 
              (m.senderId === userId && m.receiverId === firstAdvisorId) ||
              (m.receiverId === userId && m.senderId === firstAdvisorId) ||
              (m.senderId === userId && m.receiverId === 0) // Messages non assignés envoyés par le client
            );
          } else {
            // Pas de conseiller attitré, montrer seulement les messages non assignés du client
            filteredMessages = allMessages.filter(m => 
              m.senderId === userId && (m.receiverId === 0 || m.receiverId === userId)
            );
          }
        }
        
        // Trier par date décroissante (plus récents en premier)
        filteredMessages.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        res.json(this.toMessageDtoArray(filteredMessages));
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

        // Si c'est un client, il doit envoyer au conseiller attitré ou créer un nouveau message non assigné
        if (userRole === 'CLIENT') {
          // Pour un nouveau message, on met receiverId à 0 pour indiquer qu'il n'est pas encore assigné
          // Les conseillers pourront ensuite l'assigner
          finalReceiverId = 0; // 0 = non assigné
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

        // Assigner le message au conseiller
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

    // GET /api/messages/unassigned - Récupère les messages non assignés (conseillers uniquement)
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
