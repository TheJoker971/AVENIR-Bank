/**
 * DTO Order pour l'affichage
 */
export interface OrderDto {
  id: number;
  stockSymbol: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'PARTIALLY_EXECUTED';
  clientId: number;
  createdAt: string;
  executedAt?: string;
}

