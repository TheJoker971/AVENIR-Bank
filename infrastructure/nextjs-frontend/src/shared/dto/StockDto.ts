/**
 * DTO Stock pour l'affichage
 */
export interface StockDto {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  totalShares: number;
  availableShares: number;
  createdAt: string;
}

