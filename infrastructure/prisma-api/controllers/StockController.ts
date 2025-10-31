import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class StockController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/stocks - Liste toutes les actions
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const stocks = await this.prisma.stock.findMany();
        res.json(stocks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des actions' });
      }
    });

    // GET /api/stocks/:id - Récupère une action par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const stock = await this.prisma.stock.findUnique({
          where: { id },
          include: { orders: true }
        });
        
        if (!stock) {
          return res.status(404).json({ error: 'Action non trouvée' });
        }
        
        res.json(stock);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'action' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
