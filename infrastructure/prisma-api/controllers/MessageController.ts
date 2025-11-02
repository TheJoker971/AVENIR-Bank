import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class MessageController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/messages - Liste tous les messages
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const messages = await this.prisma.message.findMany({
          include: {
            sender: true,
            receiver: true
          }
        });
        res.json(messages);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
      }
    });

    // GET /api/messages/:id - Récupère un message par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const message = await this.prisma.message.findUnique({
          where: { id },
          include: {
            sender: true,
            receiver: true
          }
        });
        
        if (!message) {
          return res.status(404).json({ error: 'Message non trouvé' });
        }
        
        res.json(message);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération du message' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
