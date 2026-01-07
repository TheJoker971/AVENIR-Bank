/**
 * DTO pour un holding d'action dans le portefeuille
 */
export interface StockHoldingDto {
  id: number;
  clientId: number;
  stockSymbol: string;
  quantity: number;
  averagePurchasePrice: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO pour le portefeuille complet d'un client
 */
export interface PortfolioDto {
  holdings: StockHoldingDto[];
  totalValue: number;
  totalGainLoss: number;
  totalHoldings: number;
}

