import { StockSymbol } from "../values/StockSymbol";
import { Amount } from "../values/Amount";

/**
 * Entité représentant la possession d'actions par un client
 */
export class StockHoldingEntity {
  private constructor(
    public readonly id: number,
    public readonly clientId: number,
    public readonly stockSymbol: StockSymbol,
    public readonly quantity: number,
    public readonly averagePurchasePrice: Amount, // Prix moyen d'achat
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Crée une nouvelle possession d'actions
   */
  public static create(
    id: number,
    clientId: number,
    stockSymbol: StockSymbol,
    quantity: number,
    purchasePrice: Amount
  ): StockHoldingEntity | Error {
    if (clientId <= 0) {
      return new Error("L'ID du client doit être positif");
    }

    if (quantity <= 0) {
      return new Error("La quantité doit être positive");
    }

    if (purchasePrice.value <= 0) {
      return new Error("Le prix d'achat doit être positif");
    }

    return new StockHoldingEntity(
      id,
      clientId,
      stockSymbol,
      quantity,
      purchasePrice, // Pour la première possession, le prix moyen = prix d'achat
      new Date(),
      new Date()
    );
  }

  /**
   * Ajoute des actions à la possession existante
   * Calcule le nouveau prix moyen d'achat
   */
  public addShares(quantity: number, purchasePrice: Amount): StockHoldingEntity | Error {
    if (quantity <= 0) {
      return new Error("La quantité à ajouter doit être positive");
    }

    if (purchasePrice.value <= 0) {
      return new Error("Le prix d'achat doit être positif");
    }

    // Calcul du nouveau prix moyen : (ancien_total + nouveau_total) / nouvelle_quantité
    const oldTotal = this.averagePurchasePrice.multiply(this.quantity);
    const newTotal = purchasePrice.multiply(quantity);
    const combinedTotal = oldTotal.add(newTotal);
    const newQuantity = this.quantity + quantity;
    const newAveragePrice = combinedTotal.divide(newQuantity);

    if (newAveragePrice instanceof Error) {
      return newAveragePrice;
    }

    return new StockHoldingEntity(
      this.id,
      this.clientId,
      this.stockSymbol,
      newQuantity,
      newAveragePrice,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Retire des actions de la possession
   */
  public removeShares(quantity: number): StockHoldingEntity | Error {
    if (quantity <= 0) {
      return new Error("La quantité à retirer doit être positive");
    }

    if (quantity > this.quantity) {
      return new Error("Quantité insuffisante dans la possession");
    }

    const newQuantity = this.quantity - quantity;

    // Si toutes les actions sont vendues, on pourrait supprimer la possession
    // Mais on garde une trace avec quantité 0
    if (newQuantity === 0) {
      return new StockHoldingEntity(
        this.id,
        this.clientId,
        this.stockSymbol,
        0,
        this.averagePurchasePrice,
        this.createdAt,
        new Date()
      );
    }

    return new StockHoldingEntity(
      this.id,
      this.clientId,
      this.stockSymbol,
      newQuantity,
      this.averagePurchasePrice, // Le prix moyen reste le même
      this.createdAt,
      new Date()
    );
  }

  /**
   * Calcule la valeur actuelle de la possession (quantité × prix actuel)
   */
  public calculateCurrentValue(currentPrice: Amount): Amount {
    return currentPrice.multiply(this.quantity);
  }

  /**
   * Calcule le gain/perte non réalisé (valeur actuelle - coût d'achat)
   */
  public calculateUnrealizedGainLoss(currentPrice: Amount): Amount {
    const currentValue = this.calculateCurrentValue(currentPrice);
    const costBasis = this.averagePurchasePrice.multiply(this.quantity);
    return currentValue.subtract(costBasis);
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

  public getAveragePurchasePrice(): Amount {
    return this.averagePurchasePrice;
  }
}

