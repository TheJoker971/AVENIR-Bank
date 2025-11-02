/**
 * Use Case: Créer une nouvelle action (stock)
 */
import { StockEntity } from "domain/entities/StockEntity";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { StockSymbol } from "domain/values/StockSymbol";
import { Amount } from "domain/values/Amount";

export class CreateStockUseCase {
  constructor(
    private stockRepository: StockRepositoryInterface
  ) {}

  async execute(
    symbol: string,
    name: string,
    initialPrice: number,
    totalShares: number
  ): Promise<StockEntity | Error> {
    // Valider le symbole
    const symbolOrError = StockSymbol.create(symbol);
    if (symbolOrError instanceof Error) {
      return symbolOrError;
    }

    // Vérifier si le symbole existe déjà
    const existingStock = await this.stockRepository.findBySymbol(symbolOrError);
    if (existingStock) {
      return new Error("Une action avec ce symbole existe déjà");
    }

    // Valider le prix
    const priceOrError = Amount.create(initialPrice);
    if (priceOrError instanceof Error) {
      return priceOrError;
    }

    // Valider le nombre total d'actions
    if (totalShares <= 0) {
      return new Error("Le nombre total d'actions doit être positif");
    }

    // Créer l'action
    const stockId = Date.now(); // ID temporaire
    const stock = StockEntity.create(
      stockId,
      symbolOrError,
      name,
      priceOrError,
      totalShares
    );

    // Sauvegarder l'action
    await this.stockRepository.save(stock);

    return stock;
  }
}

