/**
 * Adaptateur API pour les actions - Infrastructure Layer
 */
import { apiClient } from './ApiClient';
import {
  StockServiceInterface,
  CreateOrderData,
} from '@/application/services/StockService';
import { StockDto, OrderDto } from '@/shared/dto';

export class StockApiAdapter implements StockServiceInterface {
  async getStocks(): Promise<StockDto[] | Error> {
    try {
      return await apiClient.get<StockDto[]>('/stocks');
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la récupération des actions');
    }
  }

  async createOrder(data: CreateOrderData): Promise<OrderDto | Error> {
    try {
      return await apiClient.post<OrderDto>('/orders', data);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la création de l\'ordre');
    }
  }

  async getUserOrders(userId: number): Promise<OrderDto[] | Error> {
    try {
      return await apiClient.get<OrderDto[]>(`/users/${userId}/orders`);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la récupération des ordres');
    }
  }

  async cancelOrder(orderId: number): Promise<void | Error> {
    try {
      await apiClient.delete(`/orders/${orderId}`);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de l\'annulation de l\'ordre');
    }
  }
}

