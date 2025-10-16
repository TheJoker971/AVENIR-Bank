import { StockSymbol } from "../values/StockSymbol";
import { Amount } from "../values/Amount";

export class StockEntity {
  private constructor(
    public readonly id: number,
    public readonly symbol: StockSymbol,
    public readonly name: string,
    public readonly currentPrice: Amount,
    public readonly totalShares: number,
    public readonly availableShares: number,
    public readonly createdAt: Date = new Date()
  ) {}

  public static create(
    id: number,
    symbol: StockSymbol,
    name: string,
    initialPrice: Amount,
    totalShares: number
  ): StockEntity {
    return new StockEntity(
      id,
      symbol,
      name,
      initialPrice,
      totalShares,
      totalShares
    );
  }

  public updatePrice(newPrice: Amount): StockEntity {
    return new StockEntity(
      this.id,
      this.symbol,
      this.name,
      newPrice,
      this.totalShares,
      this.availableShares,
      this.createdAt
    );
  }

  public executeBuyOrder(quantity: number): StockEntity | Error {
    if (quantity > this.availableShares) {
      return new Error("Quantité d'actions insuffisante disponible");
    }
    if (quantity <= 0) {
      return new Error("La quantité doit être positive");
    }
    
    const newAvailableShares = this.availableShares - quantity;
    return new StockEntity(
      this.id,
      this.symbol,
      this.name,
      this.currentPrice,
      this.totalShares,
      newAvailableShares,
      this.createdAt
    );
  }

  public executeSellOrder(quantity: number): StockEntity | Error {
    if (quantity <= 0) {
      return new Error("La quantité doit être positive");
    }
    
    const newAvailableShares = this.availableShares + quantity;
    if (newAvailableShares > this.totalShares) {
      return new Error("Impossible de vendre plus d'actions que le total émis");
    }
    
    return new StockEntity(
      this.id,
      this.symbol,
      this.name,
      this.currentPrice,
      this.totalShares,
      newAvailableShares,
      this.createdAt
    );
  }

  public getSymbol(): StockSymbol {
    return this.symbol;
  }

  public getName(): string {
    return this.name;
  }

  public getCurrentPrice(): Amount {
    return this.currentPrice;
  }

  public getAvailableShares(): number {
    return this.availableShares;
  }

  public getTotalShares(): number {
    return this.totalShares;
  }

  public calculateOrderValue(quantity: number): Amount {
    return this.currentPrice.multiply(quantity);
  }
}
