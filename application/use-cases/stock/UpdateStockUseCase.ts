import { StockEntity } from "domain/entities/StockEntity";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { StockSymbol } from "domain/values/StockSymbol";

export class UpdateStockUseCase {
  constructor(private stockRepository: StockRepositoryInterface) {}

  async execute(
    currentSymbol: string,
    newName?: string,
    newSymbol?: string,
    newTotalShares?: number
  ): Promise<StockEntity | Error> {
    // Récupérer l'action existante
    const currentSymbolOrError = StockSymbol.create(currentSymbol.toUpperCase());
    if (currentSymbolOrError instanceof Error) {
      return currentSymbolOrError;
    }

    const stock = await this.stockRepository.findBySymbol(currentSymbolOrError);
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // Préparer les nouvelles valeurs (garder les anciennes si non fournies)
    const finalName = newName || stock.getName();
    const finalSymbolStr = newSymbol ? newSymbol.toUpperCase() : stock.getSymbol().value;
    const finalTotalShares = newTotalShares !== undefined ? newTotalShares : stock.getTotalShares();

    // Valider le nouveau symbole
    const finalSymbolOrError = StockSymbol.create(finalSymbolStr);
    if (finalSymbolOrError instanceof Error) {
      return finalSymbolOrError;
    }

    // Si le symbole change, vérifier qu'il n'existe pas déjà
    if (finalSymbolStr !== currentSymbol.toUpperCase()) {
      const existingStock = await this.stockRepository.findBySymbol(finalSymbolOrError);
      if (existingStock) {
        return new Error(`Une action avec le symbole ${finalSymbolStr} existe déjà`);
      }
    }

    // Valider que le nouveau total d'actions est suffisant
    const soldShares = stock.getTotalShares() - stock.getAvailableShares();
    if (finalTotalShares < soldShares) {
      return new Error(
        `Impossible de réduire le total d'actions en dessous du nombre d'actions déjà vendues (${soldShares} actions vendues)`
      );
    }

    // Mettre à jour l'action
    const updatedStockOrError = stock.updateInfo(finalName, finalSymbolOrError, finalTotalShares);
    if (updatedStockOrError instanceof Error) {
      return updatedStockOrError;
    }

    // Sauvegarder
    await this.stockRepository.update(updatedStockOrError);

    return updatedStockOrError;
  }
}

