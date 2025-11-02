import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class NotificationController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/notifications - Liste toutes les notifications
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const notifications = await this.prisma.notification.findMany({
          include: { user: true }
        });
        res.json(notifications);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
      }
    });

    // GET /api/notifications/:id - Récupère une notification par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const notification = await this.prisma.notification.findUnique({
          where: { id },
          include: { user: true }
        });
        
        if (!notification) {
          return res.status(404).json({ error: 'Notification non trouvée' });
        }
        
        res.json(notification);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la notification' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
