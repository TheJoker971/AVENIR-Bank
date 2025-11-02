import { OrderBookDto } from '@/shared/dto';

export interface OrderBookServiceInterface {
  getOrderBook(stockSymbol: string): Promise<OrderBookDto | Error>;
  triggerMatch(stockSymbol: string): Promise<{ message: string; totalMatches: number; successCount: number; errorCount: number } | Error>;
}

