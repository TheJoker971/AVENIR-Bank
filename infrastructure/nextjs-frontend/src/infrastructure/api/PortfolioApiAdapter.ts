import { apiClient } from './ApiClient';
import { PortfolioServiceInterface } from '@/application/services/PortfolioService';
import { PortfolioDto, StockHoldingDto } from '@/shared/dto';

export class PortfolioApiAdapter implements PortfolioServiceInterface {
  async getPortfolio(userId: number): Promise<PortfolioDto | Error> {
    try {
      return await apiClient.get<PortfolioDto>('/api/portfolio');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération du portefeuille');
    }
  }

  async getHoldingBySymbol(userId: number, stockSymbol: string): Promise<StockHoldingDto | Error> {
    try {
      return await apiClient.get<StockHoldingDto>(`/api/portfolio/${stockSymbol}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération du holding');
    }
  }
}

