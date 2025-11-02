import { Router, Request, Response } from 'express';
import { OrderRepositoryInterface } from '../../../application/repositories/OrderRepositoryInterface';
import { StockRepositoryInterface } from '../../../application/repositories/StockRepositoryInterface';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { UserRepositoryInterface } from '../../../application/repositories/UserRepositoryInterface';
import { StockHoldingRepositoryInterface } from '../../../application/repositories/StockHoldingRepositoryInterface';
import { OperationRepositoryInterface } from '../../../application/repositories/OperationRepositoryInterface';
import { NotificationRepositoryInterface } from '../../../application/repositories/NotificationRepositoryInterface';
import { CreateOrderUseCase } from '../../../application/use-cases/investment/CreateOrderUseCase';
import { MatchOrdersUseCase } from '../../../application/use-cases/investment/MatchOrdersUseCase';
import { ExecuteMatchedOrdersUseCase } from '../../../application/use-cases/investment/ExecuteMatchedOrdersUseCase';
import { CalculateEquilibriumPriceUseCase } from '../../../application/use-cases/investment/CalculateEquilibriumPriceUseCase';
import { requireAuth } from '../middlewares/auth';

export class OrderController {
  private router: Router;
  private createOrderUseCase: CreateOrderUseCase;
  private matchOrdersUseCase: MatchOrdersUseCase;
  private executeMatchedOrdersUseCase: ExecuteMatchedOrdersUseCase;
  private calculateEquilibriumPriceUseCase: CalculateEquilibriumPriceUseCase;

  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface,
    private accountRepository: AccountRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private stockHoldingRepository: StockHoldingRepositoryInterface,
    private operationRepository: OperationRepositoryInterface,
    private notificationRepository: NotificationRepositoryInterface
  ) {
    this.router = Router();
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      stockRepository,
      userRepository,
      accountRepository,
      stockHoldingRepository,
      operationRepository
    );
    this.matchOrdersUseCase = new MatchOrdersUseCase(orderRepository, stockRepository);
    this.executeMatchedOrdersUseCase = new ExecuteMatchedOrdersUseCase(
      orderRepository,
      stockRepository,
      accountRepository,
      stockHoldingRepository,
      operationRepository,
      userRepository,
      notificationRepository
    );
    this.calculateEquilibriumPriceUseCase = new CalculateEquilibriumPriceUseCase(
      orderRepository,
      stockRepository
    );
    this.setupRoutes();
  }

  private toOrderDto(order: any): any {
    return {
      id: order.id,
      stockSymbol: order.stockSymbol?.value || order.stockSymbol || '',
      orderType: order.orderType?.value || order.orderType || '',
      quantity: order.quantity,
      price: typeof order.price === 'number' ? order.price : (order.price?.value || 0),
      totalAmount: typeof order.totalAmount === 'number' ? order.totalAmount : (order.totalAmount?.value || 0),
      status: order.status?.value || order.status || '',
      clientId: order.clientId || order.getClientId?.() || 0,
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      executedAt: order.executedAt?.toISOString() || null,
    };
  }

  private toOrderDtoArray(orders: any[]): any[] {
    return orders.map(order => this.toOrderDto(order));
  }

  private setupRoutes(): void {
    // GET /api/orders - Liste les ordres de l'utilisateur authentifié
    this.router.get('/', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        let orders;
        if (userRole === 'DIRECTOR') {
          // Le directeur peut voir tous les ordres
          orders = await this.orderRepository.findAll();
        } else {
          // Les autres utilisateurs voient seulement leurs ordres
          orders = await this.orderRepository.findByClientId(userId);
        }

        res.json(this.toOrderDtoArray(orders));
      } catch (error: any) {
        res.status(500).json({ error: 'Erreur lors de la récupération des ordres', details: error.message });
      }
    });

    // POST /api/orders - Crée un nouvel ordre (CLIENT uniquement)
    this.router.post('/', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        if (userRole !== 'CLIENT') {
          return res.status(403).json({ error: 'Seuls les clients peuvent créer des ordres' });
        }

        const { stockSymbol, orderType, quantity, price } = req.body;

        if (!stockSymbol || !orderType || !quantity || !price) {
          return res.status(400).json({ 
            error: 'Paramètres manquants',
            message: 'Les champs stockSymbol, orderType, quantity et price sont requis'
          });
        }

        if (orderType !== 'BUY' && orderType !== 'SELL') {
          return res.status(400).json({ error: 'orderType doit être BUY ou SELL' });
        }

        if (typeof quantity !== 'number' || quantity <= 0) {
          return res.status(400).json({ error: 'La quantité doit être un nombre positif' });
        }

        if (typeof price !== 'number' || price <= 0) {
          return res.status(400).json({ error: 'Le prix doit être un nombre positif' });
        }

        const order = await this.createOrderUseCase.execute(
          userId,
          stockSymbol.toUpperCase(),
          orderType,
          quantity,
          price
        );

        if (order instanceof Error) {
          return res.status(400).json({ error: order.message });
        }

        res.status(201).json(this.toOrderDto(order));
      } catch (error: any) {
        console.error('Erreur lors de la création de l\'ordre:', error);
        res.status(500).json({ 
          error: 'Erreur lors de la création de l\'ordre',
          details: error.message 
        });
      }
    });

    // GET /api/orders/:id - Récupère un ordre par ID
    this.router.get('/:id', requireAuth, async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const order = await this.orderRepository.findById(id);
        
        if (!order) {
          return res.status(404).json({ error: 'Ordre non trouvé' });
        }

        // Vérifier les permissions
        if (userRole !== 'DIRECTOR' && order.getClientId() !== userId) {
          return res.status(403).json({ error: 'Accès interdit' });
        }
        
        res.json(this.toOrderDto(order));
      } catch (error: any) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'ordre', details: error.message });
      }
    });

    // DELETE /api/orders/:id - Annule un ordre (seulement si PENDING)
    this.router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const userId = (req as any).userId;

        const order = await this.orderRepository.findById(id);
        
        if (!order) {
          return res.status(404).json({ error: 'Ordre non trouvé' });
        }

        // Vérifier que l'utilisateur est le propriétaire
        if (order.getClientId() !== userId) {
          return res.status(403).json({ error: 'Accès interdit' });
        }

        // Vérifier que l'ordre est en attente
        if (!order.isPending()) {
          return res.status(400).json({ error: 'Seuls les ordres en attente peuvent être annulés' });
        }

        const cancelledOrder = order.cancel();
        await this.orderRepository.update(cancelledOrder);

        res.json(this.toOrderDto(cancelledOrder));
      } catch (error: any) {
        res.status(500).json({ error: 'Erreur lors de l\'annulation de l\'ordre', details: error.message });
      }
    });

    // POST /api/orders/match/:stockSymbol - Déclenche le matching manuel pour une action
    this.router.post('/match/:stockSymbol', requireAuth, async (req: Request, res: Response) => {
      try {
        const { StockSymbol } = await import('../../../domain/values/StockSymbol');
        const stockSymbolOrError = StockSymbol.create(req.params.stockSymbol.toUpperCase());
        
        if (stockSymbolOrError instanceof Error) {
          return res.status(400).json({ error: stockSymbolOrError.message });
        }

        const matches = await this.matchOrdersUseCase.findMatches(stockSymbolOrError);
        
        if (matches.length === 0) {
          return res.json({ message: 'Aucun match trouvé', matches: [] });
        }

        const results = await this.executeMatchedOrdersUseCase.executeMatchesForStock(matches);
        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;

        res.json({
          message: `${successCount} match(s) exécuté(s) avec succès, ${errorCount} erreur(s)`,
          totalMatches: matches.length,
          successCount,
          errorCount,
          results,
        });
      } catch (error: any) {
        res.status(500).json({ error: 'Erreur lors du matching', details: error.message });
      }
    });

    // GET /api/orders/orderbook/:stockSymbol - Récupère le carnet d'ordres pour une action
    this.router.get('/orderbook/:stockSymbol', async (req: Request, res: Response) => {
      try {
        const { StockSymbol } = await import('../../../domain/values/StockSymbol');
        const stockSymbolOrError = StockSymbol.create(req.params.stockSymbol.toUpperCase());
        
        if (stockSymbolOrError instanceof Error) {
          return res.status(400).json({ error: stockSymbolOrError.message });
        }

        const orderBook = await this.calculateEquilibriumPriceUseCase.getOrderBook(stockSymbolOrError);
        const equilibriumPrice = await this.calculateEquilibriumPriceUseCase.execute(stockSymbolOrError);

        res.json({
          stockSymbol: req.params.stockSymbol.toUpperCase(),
          equilibriumPrice: equilibriumPrice instanceof Error ? 0 : equilibriumPrice.value,
          ...orderBook,
        });
      } catch (error: any) {
        res.status(500).json({ error: 'Erreur lors de la récupération du carnet d\'ordres', details: error.message });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
