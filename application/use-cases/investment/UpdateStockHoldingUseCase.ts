import { StockHoldingRepositoryInterface } from "application/repositories/StockHoldingRepositoryInterface";
import { StockHoldingEntity } from "domain/entities/StockHoldingEntity";
import { StockSymbol } from "domain/values/StockSymbol";
import { Amount } from "domain/values/Amount";

/**
 * Use case pour mettre à jour les possessions d'actions après exécution d'un ordre
 */
export class UpdateStockHoldingUseCase {
  constructor(private stockHoldingRepository: StockHoldingRepositoryInterface) {}

  /**
   * Ajoute des actions après un achat
   */
  async addShares(
    clientId: number,
    stockSymbol: StockSymbol,
    quantity: number,
    purchasePrice: Amount
  ): Promise<StockHoldingEntity | Error> {
    // Chercher si le client possède déjà cette action
    const existingHolding = await this.stockHoldingRepository.findByClientIdAndSymbol(
      clientId,
      stockSymbol
    );

    if (existingHolding) {
      // Mettre à jour la possession existante
      const updated = existingHolding.addShares(quantity, purchasePrice);
      if (updated instanceof Error) {
        return updated;
      }
      await this.stockHoldingRepository.update(updated);
      return updated;
    } else {
      // Créer une nouvelle possession
      const newHolding = StockHoldingEntity.create(
        0, // ID sera généré par le repository
        clientId,
        stockSymbol,
        quantity,
        purchasePrice
      );

      if (newHolding instanceof Error) {
        return newHolding;
      }

      await this.stockHoldingRepository.save(newHolding);
      return newHolding;
    }
  }

  /**
   * Retire des actions après une vente
   */
  async removeShares(
    clientId: number,
    stockSymbol: StockSymbol,
    quantity: number
  ): Promise<StockHoldingEntity | Error> {
    const existingHolding = await this.stockHoldingRepository.findByClientIdAndSymbol(
      clientId,
      stockSymbol
    );

    if (!existingHolding) {
      return new Error("Le client ne possède pas cette action");
    }

    if (existingHolding.getQuantity() < quantity) {
      return new Error("Quantité insuffisante dans le portefeuille");
    }

    const updated = existingHolding.removeShares(quantity);
    if (updated instanceof Error) {
      return updated;
    }

    await this.stockHoldingRepository.update(updated);
    return updated;
  }

  /**
   * Récupère les possessions d'un client
   */
  async getClientHoldings(clientId: number): Promise<StockHoldingEntity[]> {
    return await this.stockHoldingRepository.findByClientId(clientId);
  }

  /**
   * Récupère la possession d'une action spécifique pour un client
   */
  async getClientHoldingBySymbol(
    clientId: number,
    stockSymbol: StockSymbol
  ): Promise<StockHoldingEntity | null> {
    return await this.stockHoldingRepository.findByClientIdAndSymbol(clientId, stockSymbol);
  }
}

