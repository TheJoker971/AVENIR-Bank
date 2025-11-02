/**
 * Service de gestion des actions - Application Layer
 */
import { StockDto, OrderDto } from '@/shared/dto';

export interface CreateOrderData {
  userId: number;
  stockId: number;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export interface CreateStockData {
  symbol: string;
  name: string;
  initialPrice: number;
  totalShares: number;
}

export interface StockServiceInterface {
  getStocks(): Promise<StockDto[] | Error>;
  createStock(data: CreateStockData): Promise<StockDto | Error>;
  createOrder(data: CreateOrderData): Promise<OrderDto | Error>;
  getUserOrders(userId: number): Promise<OrderDto[] | Error>;
  cancelOrder(orderId: number): Promise<void | Error>;
}

