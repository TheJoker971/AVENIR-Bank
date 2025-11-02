import { Router, Request, Response } from 'express';
import { StockRepositoryInterface } from '../../../application/repositories/StockRepositoryInterface';
import { CreateStockUseCase } from '../../../application/use-cases/stock/CreateStockUseCase';
import { requireAuth, requireRole } from '../middlewares/auth';

export class StockController {
  private router: Router;
  private createStockUseCase: CreateStockUseCase;

  constructor(private stockRepository: StockRepositoryInterface) {
    this.router = Router();
    this.createStockUseCase = new CreateStockUseCase(stockRepository);
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
  }

  public getRouter(): Router {
    return this.router;
  }
}
