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

  private setupRoutes(): void {
    // GET /api/notifications - Liste les notifications de l'utilisateur authentifié
    this.router.get('/', requireAuth, filterUserNotifications, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const notifications = await this.notificationRepository.findByRecipientId(userId);
        res.json(notifications);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
      }
    });

    // GET /api/notifications/:id - Récupère une notification par ID (seulement si destinataire)
    this.router.get('/:id', requireAuth, requireNotificationAccess(this.notificationRepository), async (req: Request, res: Response) => {
      try {
        const notification = (req as any).notification;
        res.json(notification);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la notification' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
