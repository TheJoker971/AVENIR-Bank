import { apiClient } from './ApiClient';
import { OrderBookServiceInterface } from '@/application/services/OrderBookService';
import { OrderBookDto } from '@/shared/dto';

export class OrderBookApiAdapter implements OrderBookServiceInterface {
  async getOrderBook(stockSymbol: string): Promise<OrderBookDto | Error> {
    try {
      return await apiClient.get<OrderBookDto>(`/api/orders/orderbook/${stockSymbol}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération du carnet d\'ordres');
    }
  }

  async triggerMatch(stockSymbol: string): Promise<{ message: string; totalMatches: number; successCount: number; errorCount: number } | Error> {
    try {
      return await apiClient.post(`/api/orders/match/${stockSymbol}`, {});
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du matching des ordres');
    }
  }
}

