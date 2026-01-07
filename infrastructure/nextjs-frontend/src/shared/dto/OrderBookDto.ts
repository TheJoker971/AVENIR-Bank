/**
 * DTO pour un ordre dans le carnet d'ordres
 */
export interface OrderBookEntryDto {
  price: number;
  quantity: number;
  totalQuantity: number;
}

/**
 * DTO pour le carnet d'ordres complet d'une action
 */
export interface OrderBookDto {
  stockSymbol: string;
  equilibriumPrice: number;
  buyOrders: OrderBookEntryDto[];
  sellOrders: OrderBookEntryDto[];
}

