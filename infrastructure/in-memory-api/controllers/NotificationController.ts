import { Router, Request, Response } from 'express';
import { NotificationRepositoryInterface } from '../../../application/repositories/NotificationRepositoryInterface';
import { requireAuth } from '../middlewares/auth';
import { requireNotificationAccess, filterUserNotifications } from '../middlewares/notificationAuth';

export class NotificationController {
  private router: Router;

  constructor(private notificationRepository: NotificationRepositoryInterface) {
    this.router = Router();
    this.setupRoutes();
  }

  private toNotificationDto(notification: any): any {
    return {
      id: notification.id,
      userId: notification.userId || notification.recipientId || 0,
      title: notification.title || '',
      message: notification.message || '',
      read: notification.read || notification.isRead || false,
      createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  private toNotificationDtoArray(notifications: any[]): any[] {
    return notifications.map(notification => this.toNotificationDto(notification));
  }

  private setupRoutes(): void {
    // GET /api/notifications - Liste les notifications de l'utilisateur authentifié
    this.router.get('/', requireAuth, filterUserNotifications, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const notifications = await this.notificationRepository.findByRecipientId(userId);
        res.json(this.toNotificationDtoArray(notifications));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
      }
    });

    // GET /api/notifications/:id - Récupère une notification par ID (seulement si destinataire)
    this.router.get('/:id', requireAuth, requireNotificationAccess(this.notificationRepository), async (req: Request, res: Response) => {
      try {
        const notification = (req as any).notification;
        res.json(this.toNotificationDto(notification));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la notification' });
      }
    });

    // PUT /api/notifications/:id/read - Marque une notification comme lue
    this.router.put('/:id/read', requireAuth, requireNotificationAccess(this.notificationRepository), async (req: Request, res: Response) => {
      try {
        const notification = (req as any).notification;
        const markedAsRead = notification.markAsRead();
        await this.notificationRepository.update(markedAsRead);
        res.json(this.toNotificationDto(markedAsRead));
      } catch (error: any) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification', details: error.message });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
