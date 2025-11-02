/**
 * Adaptateur API pour les actions - Infrastructure Layer
 */
import { apiClient } from './ApiClient';
import {
  StockServiceInterface,
  CreateOrderData,
  CreateStockData,
} from '@/application/services/StockService';
import { StockDto, OrderDto } from '@/shared/dto';

export class StockApiAdapter implements StockServiceInterface {
  async getStocks(): Promise<StockDto[] | Error> {
    try {
      return await apiClient.get<StockDto[]>('/api/stocks');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des actions');
    }
  }

  async createStock(data: CreateStockData): Promise<StockDto | Error> {
    try {
      return await apiClient.post<StockDto>('/api/stocks', data);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création de l\'action');
    }
  }

  async createOrder(data: CreateOrderData): Promise<OrderDto | Error> {
    try {
      // Récupérer le stock pour obtenir le symbol depuis l'ID
      const stocks = await this.getStocks();
      if (stocks instanceof Error) {
        return stocks;
      }
      
      const stock = stocks.find(s => s.id === data.stockId);
      if (!stock) {
        return new Error('Action non trouvée');
      }

      // Convertir stockId en stockSymbol pour l'API
      return await apiClient.post<OrderDto>('/api/orders', {
        stockSymbol: stock.symbol,
        orderType: data.type,
        quantity: data.quantity,
        price: data.price,
      });
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création de l\'ordre');
    }
  }

  async getUserOrders(userId: number): Promise<OrderDto[] | Error> {
    try {
      return await apiClient.get<OrderDto[]>('/api/orders');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des ordres');
    }
  }

  async cancelOrder(orderId: number): Promise<void | Error> {
    try {
      await apiClient.delete(`/api/orders/${orderId}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'annulation de l\'ordre');
    }
  }
}

