import { Router, Request, Response } from 'express';
import { OrderRepositoryInterface } from '../../../application/repositories/OrderRepositoryInterface';
import { StockRepositoryInterface } from '../../../application/repositories/StockRepositoryInterface';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';

export class OrderController {
  private router: Router;

  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface,
    private accountRepository: AccountRepositoryInterface
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/orders - Liste tous les ordres
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const orders = await this.orderRepository.findAll();
        res.json(orders);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des ordres' });
      }
    });

    // GET /api/orders/:id - Récupère un ordre par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const order = await this.orderRepository.findById(id);
        
        if (!order) {
          return res.status(404).json({ error: 'Ordre non trouvé' });
        }
        
        res.json(order);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'ordre' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
