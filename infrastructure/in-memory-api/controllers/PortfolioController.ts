import { Router, Request, Response } from 'express';
import { StockHoldingRepositoryInterface } from '../../../application/repositories/StockHoldingRepositoryInterface';
import { StockRepositoryInterface } from '../../../application/repositories/StockRepositoryInterface';
import { requireAuth } from '../middlewares/auth';

export class PortfolioController {
  private router: Router;

  constructor(
    private stockHoldingRepository: StockHoldingRepositoryInterface,
    private stockRepository: StockRepositoryInterface
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private toHoldingDto(holding: any, stock: any): any {
    const currentPrice = stock ? (typeof stock.currentPrice === 'number' ? stock.currentPrice : (stock.currentPrice?.value || 0)) : 0;
    const currentValue = holding.calculateCurrentValue ? holding.calculateCurrentValue(stock?.currentPrice || { value: 0 }) : (holding.quantity * currentPrice);
    const unrealizedGainLoss = holding.calculateUnrealizedGainLoss ? holding.calculateUnrealizedGainLoss(stock?.currentPrice || { value: 0 }) : { value: 0 };

    return {
      id: holding.id,
      stockSymbol: holding.stockSymbol?.value || holding.stockSymbol || '',
      stockName: stock?.name || 'Action inconnue',
      quantity: holding.quantity || holding.getQuantity?.() || 0,
      averagePurchasePrice: typeof holding.averagePurchasePrice === 'number' 
        ? holding.averagePurchasePrice 
        : (holding.averagePurchasePrice?.value || holding.getAveragePurchasePrice?.().value || 0),
      currentPrice,
      currentValue: typeof currentValue === 'number' ? currentValue : (currentValue?.value || 0),
      unrealizedGainLoss: typeof unrealizedGainLoss === 'number' ? unrealizedGainLoss : (unrealizedGainLoss?.value || 0),
    };
  }

  private toPortfolioDto(holdings: any[], stocks: Map<string, any>): any[] {
    return holdings
      .filter(h => h.getQuantity() > 0)
      .map(holding => {
        const symbol = holding.getStockSymbol().value;
        const stock = stocks.get(symbol) || null;
        return this.toHoldingDto(holding, stock);
      });
  }

  private setupRoutes(): void {
    // GET /api/portfolio - Récupère le portefeuille de l'utilisateur authentifié
    this.router.get('/', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;

        // Récupérer les holdings de l'utilisateur
        const holdings = await this.stockHoldingRepository.findByClientId(userId);
        
        // Récupérer toutes les actions pour obtenir les prix actuels
        const allStocks = await this.stockRepository.findAll();
        const stocksMap = new Map<string, any>();
        for (const stock of allStocks) {
          stocksMap.set(stock.getSymbol().value, stock);
        }

        const portfolio = this.toPortfolioDto(holdings, stocksMap);

        // Calculer la valeur totale du portefeuille
        const totalValue = portfolio.reduce((sum, holding) => sum + (holding.currentValue || 0), 0);
        const totalGainLoss = portfolio.reduce((sum, holding) => sum + (holding.unrealizedGainLoss || 0), 0);

        res.json({
          holdings: portfolio,
          totalValue,
          totalGainLoss,
          totalHoldings: portfolio.length,
        });
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la récupération du portefeuille', 
          details: error.message 
        });
      }
    });

    // GET /api/portfolio/:stockSymbol - Récupère les holdings d'une action spécifique
    this.router.get('/:stockSymbol', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const { StockSymbol } = await import('../../../domain/values/StockSymbol');
        
        const stockSymbolOrError = StockSymbol.create(req.params.stockSymbol.toUpperCase());
        if (stockSymbolOrError instanceof Error) {
          return res.status(400).json({ error: stockSymbolOrError.message });
        }

        const holding = await this.stockHoldingRepository.findByClientIdAndSymbol(userId, stockSymbolOrError);
        
        if (!holding || holding.getQuantity() === 0) {
          return res.status(404).json({ error: 'Vous ne possédez pas cette action' });
        }

        // Récupérer l'action pour obtenir le prix actuel
        const stock = await this.stockRepository.findBySymbol(stockSymbolOrError);

        res.json(this.toHoldingDto(holding, stock));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la récupération du holding', 
          details: error.message 
        });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

