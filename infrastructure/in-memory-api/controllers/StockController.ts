import { Router, Request, Response } from 'express';
import { StockRepositoryInterface } from '../../../application/repositories/StockRepositoryInterface';
import { OrderRepositoryInterface } from '../../../application/repositories/OrderRepositoryInterface';
import { StockHoldingRepositoryInterface } from '../../../application/repositories/StockHoldingRepositoryInterface';
import { CreateStockUseCase } from '../../../application/use-cases/stock/CreateStockUseCase';
import { UpdateStockUseCase } from '../../../application/use-cases/stock/UpdateStockUseCase';
import { DeleteStockUseCase } from '../../../application/use-cases/stock/DeleteStockUseCase';
import { requireAuth, requireRole } from '../middlewares/auth';
import { SocketServer } from '../socket/socketServer';
import { StockSymbol } from '../../../domain/values/StockSymbol';

export class StockController {
  private router: Router;
  private createStockUseCase: CreateStockUseCase;
  private updateStockUseCase: UpdateStockUseCase;
  private deleteStockUseCase: DeleteStockUseCase;

  constructor(
    private stockRepository: StockRepositoryInterface,
    private socketServer: SocketServer,
    private orderRepository?: OrderRepositoryInterface,
    private stockHoldingRepository?: StockHoldingRepositoryInterface
  ) {
    this.router = Router();
    this.createStockUseCase = new CreateStockUseCase(stockRepository);
    this.updateStockUseCase = new UpdateStockUseCase(stockRepository);
    if (orderRepository && stockHoldingRepository) {
      this.deleteStockUseCase = new DeleteStockUseCase(
        stockRepository,
        orderRepository,
        stockHoldingRepository
      );
    }
    this.setupRoutes();
  }

  private toStockDto(stock: any): any {
    return {
      id: stock.id,
      symbol: stock.symbol?.value || stock.symbol || '',
      name: stock.name,
      currentPrice: typeof stock.currentPrice === 'number' 
        ? stock.currentPrice 
        : (stock.currentPrice?.value || 0),
      totalShares: stock.totalShares,
      availableShares: stock.availableShares,
      available: stock.availableShares > 0,
      createdAt: stock.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  private toStockDtoArray(stocks: any[]): any[] {
    return stocks.map(stock => this.toStockDto(stock));
  }

  private setupRoutes(): void {
    // GET /api/stocks - Liste toutes les actions
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const stocks = await this.stockRepository.findAll();
        res.json(this.toStockDtoArray(stocks));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des actions' });
      }
    });

    // GET /api/stocks/symbol/:symbol - Récupère une action par symbole
    this.router.get('/symbol/:symbol', async (req: Request, res: Response) => {
      try {
        const symbolStr = req.params.symbol.toUpperCase();
        const symbolOrError = StockSymbol.create(symbolStr);
        
        if (symbolOrError instanceof Error) {
          return res.status(400).json({ error: symbolOrError.message });
        }
        
        const stock = await this.stockRepository.findBySymbol(symbolOrError);
        
        if (!stock) {
          return res.status(404).json({ error: 'Action non trouvée' });
        }
        
        res.json(this.toStockDto(stock));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'action' });
      }
    });

    // GET /api/stocks/:id - Récupère une action par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const stock = await this.stockRepository.findById(id);
        
        if (!stock) {
          return res.status(404).json({ error: 'Action non trouvée' });
        }
        
        res.json(this.toStockDto(stock));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'action' });
      }
    });

    // POST /api/stocks - Crée une nouvelle action (DIRECTOR uniquement)
    this.router.post('/', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const { symbol, name, initialPrice, totalShares } = req.body;

        if (!symbol || !name || initialPrice === undefined || !totalShares) {
          return res.status(400).json({ 
            error: 'Paramètres manquants',
            message: 'Les champs symbol, name, initialPrice et totalShares sont requis'
          });
        }

        if (typeof initialPrice !== 'number' || initialPrice <= 0) {
          return res.status(400).json({ error: 'Le prix initial doit être un nombre positif' });
        }

        if (typeof totalShares !== 'number' || totalShares <= 0) {
          return res.status(400).json({ error: 'Le nombre total d\'actions doit être un nombre positif' });
        }

        const stock = await this.createStockUseCase.execute(
          symbol.toUpperCase(),
          name,
          initialPrice,
          totalShares
        );

        if (stock instanceof Error) {
          return res.status(400).json({ error: stock.message });
        }

        res.status(201).json(this.toStockDto(stock));
      } catch (error: any) {
        console.error('Erreur lors de la création de l\'action:', error);
        res.status(500).json({ 
          error: 'Erreur lors de la création de l\'action',
          details: error.message 
        });
      }
    });

    // PUT /api/stocks/:symbol - Modifie une action (DIRECTOR uniquement)
    this.router.put('/:symbol', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const currentSymbol = req.params.symbol.toUpperCase();
        const { name, symbol: newSymbol, totalShares } = req.body;

        // Au moins un champ doit être fourni
        if (!name && !newSymbol && totalShares === undefined) {
          return res.status(400).json({
            error: 'Aucune modification fournie',
            message: 'Veuillez fournir au moins un champ à modifier (name, symbol, ou totalShares)'
          });
        }

        const updatedStock = await this.updateStockUseCase.execute(
          currentSymbol,
          name,
          newSymbol ? newSymbol.toUpperCase() : undefined,
          totalShares ? parseInt(totalShares) : undefined
        );

        if (updatedStock instanceof Error) {
          return res.status(400).json({ error: updatedStock.message });
        }

        // Émettre un événement WebSocket pour notifier les clients
        try {
          this.socketServer.getIO().emit('stockUpdated', {
            symbol: updatedStock.getSymbol().value,
            currentPrice: updatedStock.getCurrentPrice().value,
            availableShares: updatedStock.getAvailableShares(),
            totalShares: updatedStock.getTotalShares(),
            name: updatedStock.getName()
          });
        } catch (wsError) {
          console.error('Erreur lors de l\'émission WebSocket:', wsError);
        }

        res.json(this.toStockDto(updatedStock));
      } catch (error: any) {
        console.error('Erreur lors de la modification de l\'action:', error);
        res.status(500).json({
          error: 'Erreur lors de la modification de l\'action',
          details: error.message
        });
      }
    });

    // DELETE /api/stocks/:symbol - Supprime une action (DIRECTOR uniquement)
    this.router.delete('/:symbol', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const symbol = req.params.symbol.toUpperCase();

        if (!this.deleteStockUseCase) {
          return res.status(500).json({
            error: 'Service de suppression non disponible',
            message: 'Le contrôleur n\'a pas été initialisé avec les dépendances nécessaires'
          });
        }

        const result = await this.deleteStockUseCase.execute(symbol);

        if (result instanceof Error) {
          return res.status(400).json({ error: result.message });
        }

        // Émettre un événement WebSocket pour notifier les clients
        try {
          this.socketServer.getIO().emit('stockDeleted', { symbol });
        } catch (wsError) {
          console.error('Erreur lors de l\'émission WebSocket:', wsError);
        }

        res.json(result);
      } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'action:', error);
        res.status(500).json({
          error: 'Erreur lors de la suppression de l\'action',
          details: error.message
        });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
