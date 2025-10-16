import { StockSymbolInvalidError } from "../errors/StockSymbolInvalidError";

export type StockSymbolType = string;

export class StockSymbol {
  private static readonly SYMBOL_PATTERN = /^[A-Z]{1,5}$/;
  private static readonly MAX_LENGTH = 5;

  public static create(symbol: string): StockSymbol | StockSymbolInvalidError {
    if (!symbol || typeof symbol !== 'string') {
      return new StockSymbolInvalidError("Le symbole d'action ne peut pas être vide");
    }

    const trimmedSymbol = symbol.trim().toUpperCase();
    
    if (trimmedSymbol.length > StockSymbol.MAX_LENGTH) {
      return new StockSymbolInvalidError(`Le symbole ne peut pas dépasser ${StockSymbol.MAX_LENGTH} caractères`);
    }

    if (!StockSymbol.SYMBOL_PATTERN.test(trimmedSymbol)) {
      return new StockSymbolInvalidError("Le symbole doit contenir uniquement des lettres majuscules");
    }

    return new StockSymbol(trimmedSymbol);
  }

  private constructor(public readonly value: StockSymbolType) {}

  public equals(other: StockSymbol): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
