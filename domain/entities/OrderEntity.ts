import { StockSymbol } from "../values/StockSymbol";
import { Amount } from "../values/Amount";
import { OrderType } from "../values/OrderType";
import { OrderStatus } from "../values/OrderStatus";

export class OrderEntity {
  private constructor(
    public readonly id: number,
    public readonly stockSymbol: StockSymbol,
    public readonly orderType: OrderType,
    public readonly quantity: number,
    public readonly price: Amount,
    public readonly totalAmount: Amount,
    public readonly status: OrderStatus,
    public readonly clientId: number,
    public readonly createdAt: Date = new Date(),
    public readonly executedAt?: Date
  ) {}

  public static createBuyOrder(
    id: number,
    stockSymbol: StockSymbol,
    quantity: number,
    price: Amount,
    clientId: number
  ): OrderEntity | Error {
    if (quantity <= 0) {
      return new Error("La quantité doit être positive");
    }
    if (price.value <= 0) {
      return new Error("Le prix doit être positif");
    }

    const orderType = OrderType.create("BUY");
    if (orderType instanceof Error) {
      return orderType;
    }

    const totalAmount = price.multiply(quantity);
    const status = OrderStatus.pending();

    return new OrderEntity(
      id,
      stockSymbol,
      orderType,
      quantity,
      price,
      totalAmount,
      status,
      clientId
    );
  }

  public static createSellOrder(
    id: number,
    stockSymbol: StockSymbol,
    quantity: number,
    price: Amount,
    clientId: number
  ): OrderEntity | Error {
    if (quantity <= 0) {
      return new Error("La quantité doit être positive");
    }
    if (price.value <= 0) {
      return new Error("Le prix doit être positif");
    }

    const orderType = OrderType.create("SELL");
    if (orderType instanceof Error) {
      return orderType;
    }

    const totalAmount = price.multiply(quantity);
    const status = OrderStatus.pending();

    return new OrderEntity(
      id,
      stockSymbol,
      orderType,
      quantity,
      price,
      totalAmount,
      status,
      clientId
    );
  }

  public execute(): OrderEntity {
    const executedStatus = OrderStatus.executed();
    return new OrderEntity(
      this.id,
      this.stockSymbol,
      this.orderType,
      this.quantity,
      this.price,
      this.totalAmount,
      executedStatus,
      this.clientId,
      this.createdAt,
      new Date()
    );
  }

  public cancel(): OrderEntity {
    const cancelledStatus = OrderStatus.cancelled();
    return new OrderEntity(
      this.id,
      this.stockSymbol,
      this.orderType,
      this.quantity,
      this.price,
      this.totalAmount,
      cancelledStatus,
      this.clientId,
      this.createdAt,
      this.executedAt
    );
  }

  public partiallyExecute(executedQuantity: number): OrderEntity | Error {
    if (executedQuantity <= 0 || executedQuantity > this.quantity) {
      return new Error("Quantité exécutée invalide");
    }

    const newQuantity = this.quantity - executedQuantity;
    const newTotalAmount = this.price.multiply(newQuantity);
    const partialStatus = OrderStatus.partiallyExecuted();

    return new OrderEntity(
      this.id,
      this.stockSymbol,
      this.orderType,
      newQuantity,
      this.price,
      newTotalAmount,
      partialStatus,
      this.clientId,
      this.createdAt,
      new Date()
    );
  }

  public isBuyOrder(): boolean {
    return this.orderType.isBuy();
  }

  public isSellOrder(): boolean {
    return this.orderType.isSell();
  }

  public isPending(): boolean {
    return this.status.isPending();
  }

  public isExecuted(): boolean {
    return this.status.isExecuted();
  }

  public isCancelled(): boolean {
    return this.status.isCancelled();
  }

  public isPartiallyExecuted(): boolean {
    return this.status.isPartiallyExecuted();
  }

  public getClientId(): number {
    return this.clientId;
  }

  public getStockSymbol(): StockSymbol {
    return this.stockSymbol;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getPrice(): Amount {
    return this.price;
  }

  public getTotalAmount(): Amount {
    return this.totalAmount;
  }

  public calculateFees(): Amount {
    // Frais fixes de 1€ à l'achat et à la vente
    return new Amount(1);
  }

  public getTotalWithFees(): Amount {
    return this.totalAmount.add(this.calculateFees());
  }
}
