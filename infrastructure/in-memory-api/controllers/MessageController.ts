import { Router, Request, Response } from 'express';
import { MessageRepositoryInterface } from '../../../application/repositories/MessageRepositoryInterface';
import { requireAuth } from '../middlewares/auth';
import { requireMessageAccess, requireCanSendMessage, filterUserMessages } from '../middlewares/messageAuth';
import { MessageEntity } from '../../../domain/entities/MessageEntity';

export class MessageController {
  private router: Router;

  constructor(private messageRepository: MessageRepositoryInterface) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/messages - Liste les messages de l'utilisateur authentifié
    this.router.get('/', requireAuth, filterUserMessages, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        
        // Récupérer les messages envoyés et reçus par l'utilisateur
        const sentMessages = await this.messageRepository.findBySenderId(userId);
        const receivedMessages = await this.messageRepository.findByReceiverId(userId);
        
        // Combiner les deux listes et dédoublonner si nécessaire
        const allMessages = [...sentMessages, ...receivedMessages];
        
        // Trier par date décroissante (plus récents en premier)
        allMessages.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        res.json(allMessages);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
      }
    });

    // GET /api/messages/:id - Récupère un message par ID (seulement si propriétaire)
    this.router.get('/:id', requireAuth, requireMessageAccess(this.messageRepository), async (req: Request, res: Response) => {
      try {
        const message = (req as any).message;
        res.json(message);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du message' });
      }
    });

    // POST /api/messages - Créer un nouveau message
    this.router.post('/', requireAuth, requireCanSendMessage(), async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
          return res.status(400).json({ 
            error: 'Données invalides',
            message: 'Les champs receiverId et message sont requis'
          });
        }

        // Valider le type des données
        const receiverIdNum = parseInt(receiverId);
        if (isNaN(receiverIdNum)) {
          return res.status(400).json({ error: 'receiverId doit être un nombre' });
        }

        if (typeof message !== 'string' || message.trim().length === 0) {
          return res.status(400).json({ error: 'Le message ne peut pas être vide' });
        }

        // Créer le message
        const newMessage = MessageEntity.create(0, userId, receiverIdNum, message.trim());
        await this.messageRepository.save(newMessage);
        
        res.status(201).json(newMessage);
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la création du message',
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
