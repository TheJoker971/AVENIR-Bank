import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockHoldingRepositoryInterface } from "application/repositories/StockHoldingRepositoryInterface";
import { StockSymbol } from "domain/values/StockSymbol";

export class DeleteStockUseCase {
  constructor(
    private stockRepository: StockRepositoryInterface,
    private orderRepository: OrderRepositoryInterface,
    private stockHoldingRepository: StockHoldingRepositoryInterface
  ) {}

  async execute(symbol: string): Promise<{ success: true; message: string } | Error> {
    // Valider et récupérer l'action
    const symbolOrError = StockSymbol.create(symbol.toUpperCase());
    if (symbolOrError instanceof Error) {
      return symbolOrError;
    }

    const stock = await this.stockRepository.findBySymbol(symbolOrError);
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // Vérifier qu'aucun ordre en attente n'existe
    const pendingOrders = await this.orderRepository.findByStockSymbol(symbolOrError);
    const activePendingOrders = pendingOrders.filter(order => order.isPending());
    
    if (activePendingOrders.length > 0) {
      return new Error(
        `Impossible de supprimer cette action: ${activePendingOrders.length} ordre(s) en attente existe(nt). Veuillez d'abord annuler tous les ordres en attente.`
      );
    }

    // Vérifier qu'aucun holding n'existe (clients possédant des actions)
    const holdings = await this.stockHoldingRepository.findByStockSymbol(symbolOrError);
    const activeHoldings = holdings.filter(holding => holding.getQuantity() > 0);
    
    if (activeHoldings.length > 0) {
      const totalShares = activeHoldings.reduce((sum, h) => sum + h.getQuantity(), 0);
      return new Error(
        `Impossible de supprimer cette action: ${activeHoldings.length} client(s) possède(nt) ${totalShares} action(s). Les clients doivent d'abord vendre toutes leurs actions.`
      );
    }

    // Supprimer l'action
    await this.stockRepository.delete(stock.getId());

    return {
      success: true,
      message: `L'action ${symbol.toUpperCase()} a été supprimée avec succès`
    };
  }
}

