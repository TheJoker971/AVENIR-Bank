import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class OrderController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/orders - Liste tous les ordres
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const orders = await this.prisma.order.findMany({
          include: {
            client: true,
            stock: true,
            account: true
          }
        });
        res.json(orders);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des ordres' });
      }
    });

    // GET /api/orders/:id - Récupère un ordre par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const order = await this.prisma.order.findUnique({
          where: { id },
          include: {
            client: true,
            stock: true,
            account: true
          }
        });
        
        if (!order) {
          return res.status(404).json({ error: 'Ordre non trouvé' });
        }
        
        res.json(order);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'ordre' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
