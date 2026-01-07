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
    // Nouvelle méthode: Toujours calculer un prix basé sur l'offre et la demande
    
    // Cas 1: Seulement des ordres d'achat (demande)
    if (buyOrders.length > 0 && sellOrders.length === 0) {
      // Le prix tend vers le meilleur prix d'achat
      const bestBuyPrice = buyOrders[0].getPrice().value;
      const currentPrice = stock.getCurrentPrice().value;
      // Prix = moyenne pondérée entre prix actuel et meilleur prix d'achat
      const newPrice = (currentPrice * 0.7 + bestBuyPrice * 0.3);
      console.log(`📊 [CalculateEquilibrium] Seulement achats: ${currentPrice}€ → ${newPrice.toFixed(2)}€`);
      return Amount.create(newPrice);
    }

    // Cas 2: Seulement des ordres de vente (offre)
    if (sellOrders.length > 0 && buyOrders.length === 0) {
      // Le prix tend vers le meilleur prix de vente
      const bestSellPrice = sellOrders[0].getPrice().value;
      const currentPrice = stock.getCurrentPrice().value;
      // Prix = moyenne pondérée entre prix actuel et meilleur prix de vente
      const newPrice = (currentPrice * 0.7 + bestSellPrice * 0.3);
      console.log(`📊 [CalculateEquilibrium] Seulement ventes: ${currentPrice}€ → ${newPrice.toFixed(2)}€`);
      return Amount.create(newPrice);
    }

    // Cas 3: Ordres d'achat ET de vente
    if (buyOrders.length > 0 && sellOrders.length > 0) {
      const bestBuyPrice = buyOrders[0].getPrice().value;
      const bestSellPrice = sellOrders[0].getPrice().value;

      if (bestBuyPrice >= bestSellPrice) {
        // Il y a une intersection, calculer le prix d'équilibre
        const equilibriumPrice = (bestBuyPrice + bestSellPrice) / 2;
        console.log(`📊 [CalculateEquilibrium] Intersection: ${equilibriumPrice.toFixed(2)}€ (achat: ${bestBuyPrice}€, vente: ${bestSellPrice}€)`);
        return Amount.create(equilibriumPrice);
      } else {
        // Pas d'intersection directe, mais on calcule quand même un nouveau prix
        // Prix = moyenne entre le meilleur prix d'achat et le meilleur prix de vente
        const midPrice = (bestBuyPrice + bestSellPrice) / 2;
        console.log(`📊 [CalculateEquilibrium] Pas d'intersection: ${midPrice.toFixed(2)}€ (achat: ${bestBuyPrice}€, vente: ${bestSellPrice}€)`);
        return Amount.create(midPrice);
      }
    }

    // Cas 4: Aucun ordre (ne devrait pas arriver ici)
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

