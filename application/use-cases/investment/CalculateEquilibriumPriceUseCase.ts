import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { StockSymbol } from "domain/values/StockSymbol";
import { Amount } from "domain/values/Amount";
import { OrderStatus } from "domain/values/OrderStatus";

/**
 * Use case pour calculer le prix d'équilibre d'une action à partir du carnet d'ordres
 * Le prix d'équilibre est calculé comme l'intersection entre l'offre (SELL) et la demande (BUY)
 */
export class CalculateEquilibriumPriceUseCase {
  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface
  ) {}

  /**
   * Calcule le prix d'équilibre pour une action donnée
   * Algorithme: Trouver le prix où la quantité demandée = quantité offerte
   * Si aucune intersection, retourner le prix actuel de l'action
   */
  async execute(stockSymbol: StockSymbol): Promise<Amount | Error> {
    // Récupérer l'action pour connaître son prix actuel
    const stock = await this.stockRepository.findBySymbol(stockSymbol);
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // Récupérer tous les ordres en attente pour cette action
    const pendingOrders = await this.orderRepository.findByStockSymbol(stockSymbol);
    const filteredPendingOrders = pendingOrders.filter(order => order.isPending());

    if (filteredPendingOrders.length === 0) {
      // Pas d'ordres en attente, retourner le prix actuel
      return stock.getCurrentPrice();
    }

    // Séparer les ordres d'achat et de vente
    const buyOrders = filteredPendingOrders
      .filter(order => order.isBuyOrder())
      .sort((a, b) => {
        // Trier par prix décroissant (les meilleurs prix d'achat en premier)
        if (b.getPrice().value !== a.getPrice().value) {
          return b.getPrice().value - a.getPrice().value;
        }
        // Si même prix, trier par date (FIFO)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    const sellOrders = filteredPendingOrders
      .filter(order => order.isSellOrder())
      .sort((a, b) => {
        // Trier par prix croissant (les meilleurs prix de vente en premier)
        if (a.getPrice().value !== b.getPrice().value) {
          return a.getPrice().value - b.getPrice().value;
        }
        // Si même prix, trier par date (FIFO)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    // Calculer le prix d'équilibre
    // Méthode: Trouver le meilleur prix d'achat >= meilleur prix de vente
    if (buyOrders.length === 0 || sellOrders.length === 0) {
      // Pas d'intersection possible, retourner le prix actuel
      return stock.getCurrentPrice();
    }

    const bestBuyPrice = buyOrders[0].getPrice().value; // Prix le plus élevé proposé
    const bestSellPrice = sellOrders[0].getPrice().value; // Prix le plus bas demandé

    if (bestBuyPrice >= bestSellPrice) {
      // Il y a une intersection: le prix d'équilibre est le prix moyen
      const equilibriumPrice = (bestBuyPrice + bestSellPrice) / 2;
      const priceOrError = Amount.create(equilibriumPrice);
      return priceOrError instanceof Error ? stock.getCurrentPrice() : priceOrError;
    }

    // Pas d'intersection directe, retourner le prix actuel de l'action
    return stock.getCurrentPrice();
  }

  /**
   * Obtient le carnet d'ordres (order book) pour une action
   * Retourne les ordres d'achat et de vente triés par prix
   */
  async getOrderBook(stockSymbol: StockSymbol): Promise<{
    buyOrders: Array<{ price: number; quantity: number; totalQuantity: number }>;
    sellOrders: Array<{ price: number; quantity: number; totalQuantity: number }>;
  }> {
    const pendingOrders = await this.orderRepository.findByStockSymbol(stockSymbol);
    const filteredPendingOrders = pendingOrders.filter(order => order.isPending());

    // Grouper les ordres par prix et calculer la quantité totale
    const buyOrdersMap = new Map<number, number>();
    const sellOrdersMap = new Map<number, number>();

    for (const order of filteredPendingOrders) {
      const price = order.getPrice().value;
      if (order.isBuyOrder()) {
        buyOrdersMap.set(price, (buyOrdersMap.get(price) || 0) + order.getQuantity());
      } else {
        sellOrdersMap.set(price, (sellOrdersMap.get(price) || 0) + order.getQuantity());
      }
    }

    // Convertir en tableaux triés
    const buyOrders = Array.from(buyOrdersMap.entries())
      .map(([price, totalQuantity]) => ({ price, quantity: totalQuantity, totalQuantity }))
      .sort((a, b) => b.price - a.price); // Prix décroissant

    const sellOrders = Array.from(sellOrdersMap.entries())
      .map(([price, totalQuantity]) => ({ price, quantity: totalQuantity, totalQuantity }))
      .sort((a, b) => a.price - b.price); // Prix croissant

    return { buyOrders, sellOrders };
  }
}

