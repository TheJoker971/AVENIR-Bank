import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { StockSymbol } from "domain/values/StockSymbol";
import { OrderEntity } from "domain/entities/OrderEntity";
import { Amount } from "domain/values/Amount";

/**
 * Représente une paire d'ordres qui peuvent être matchés
 */
export interface MatchedOrderPair {
  buyOrder: OrderEntity;
  sellOrder: OrderEntity;
  matchPrice: Amount; // Prix auquel la transaction sera exécutée
  matchQuantity: number; // Quantité qui sera échangée
}

/**
 * Use case pour matcher les ordres d'achat et de vente
 * Algorithme: FIFO par prix (meilleur prix en premier)
 */
export class MatchOrdersUseCase {
  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface
  ) {}

  /**
   * Trouve et retourne les paires d'ordres qui peuvent être matchés pour une action donnée
   */
  async findMatches(stockSymbol: StockSymbol): Promise<MatchedOrderPair[]> {
    // Récupérer tous les ordres en attente pour cette action
    const pendingOrders = await this.orderRepository.findByStockSymbol(stockSymbol);
    const filteredPendingOrders = pendingOrders.filter(order => order.isPending());

    // Séparer et trier les ordres
    const buyOrders = filteredPendingOrders
      .filter(order => order.isBuyOrder())
      .sort((a, b) => {
        // Trier par prix décroissant (meilleur prix d'achat en premier)
        if (b.getPrice().value !== a.getPrice().value) {
          return b.getPrice().value - a.getPrice().value;
        }
        // Si même prix, FIFO
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    const sellOrders = filteredPendingOrders
      .filter(order => order.isSellOrder())
      .sort((a, b) => {
        // Trier par prix croissant (meilleur prix de vente en premier)
        if (a.getPrice().value !== b.getPrice().value) {
          return a.getPrice().value - b.getPrice().value;
        }
        // Si même prix, FIFO
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    const matches: MatchedOrderPair[] = [];
    const usedBuyOrders = new Set<number>();
    const usedSellOrders = new Set<number>();

    // Algorithme de matching: Pour chaque ordre d'achat, chercher un ordre de vente compatible
    for (const buyOrder of buyOrders) {
      if (usedBuyOrders.has(buyOrder.id)) continue;

      for (const sellOrder of sellOrders) {
        if (usedSellOrders.has(sellOrder.id)) continue;

        // Vérifier si les ordres sont compatibles (prix d'achat >= prix de vente)
        if (buyOrder.getPrice().value >= sellOrder.getPrice().value) {
          // Calculer la quantité à échanger (minimum des deux)
          const matchQuantity = Math.min(buyOrder.getQuantity(), sellOrder.getQuantity());

          // Le prix de match est le prix moyen (ou on peut utiliser le prix de l'ordre de vente)
          const matchPriceValue = (buyOrder.getPrice().value + sellOrder.getPrice().value) / 2;
          const matchPrice = Amount.create(matchPriceValue);

          if (matchPrice instanceof Error) {
            continue; // Skip si erreur de création du prix
          }

          matches.push({
            buyOrder,
            sellOrder,
            matchPrice,
            matchQuantity,
          });

          // Marquer les ordres comme utilisés si complètement matchés
          if (matchQuantity === buyOrder.getQuantity()) {
            usedBuyOrders.add(buyOrder.id);
            // Sortir de la boucle des ordres de vente pour passer au prochain ordre d'achat
            break;
          }
          if (matchQuantity === sellOrder.getQuantity()) {
            usedSellOrders.add(sellOrder.id);
          }
        }
      }
    }

    return matches;
  }

  /**
   * Trouve les matches pour toutes les actions et retourne tous les matches
   */
  async findAllMatches(): Promise<Map<StockSymbol, MatchedOrderPair[]>> {
    const allStocks = await this.stockRepository.findAll();
    const allMatches = new Map<StockSymbol, MatchedOrderPair[]>();

    for (const stock of allStocks) {
      const matches = await this.findMatches(stock.getSymbol());
      if (matches.length > 0) {
        allMatches.set(stock.getSymbol(), matches);
      }
    }

    return allMatches;
  }
}

