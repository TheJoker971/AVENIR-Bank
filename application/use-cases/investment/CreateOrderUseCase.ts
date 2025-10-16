import { OrderEntity } from "domain/entities/OrderEntity";
import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { StockSymbol } from "domain/values/StockSymbol";
import { Amount } from "domain/values/Amount";

export class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(
    clientId: number,
    stockSymbol: string,
    orderType: "BUY" | "SELL",
    quantity: number,
    price: number
  ): Promise<OrderEntity | Error> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(clientId);
    if (user instanceof Error) {
      return new Error("Utilisateur non trouvé");
    }

    // Vérifier que l'action existe
    const stockSymbolOrError = StockSymbol.create(stockSymbol);
    if (stockSymbolOrError instanceof Error) return stockSymbolOrError;

    const stock = await this.stockRepository.findBySymbol(stockSymbolOrError);
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // Créer les objets de valeur
    const amountOrError = Amount.create(price);
    if (amountOrError instanceof Error) return amountOrError;

    // Créer l'ordre
    let order: OrderEntity | Error;
    if (orderType === "BUY") {
      order = OrderEntity.createBuyOrder(
        Date.now(), // ID temporaire
        stockSymbolOrError,
        quantity,
        amountOrError,
        clientId
      );
    } else {
      order = OrderEntity.createSellOrder(
        Date.now(), // ID temporaire
        stockSymbolOrError,
        quantity,
        amountOrError,
        clientId
      );
    }

    if (order instanceof Error) {
      return order;
    }

    // Sauvegarder l'ordre
    await this.orderRepository.save(order);

    return order;
  }
}
