/**
 * Adaptateur API pour la banque - Infrastructure Layer
 */
import { apiClient } from './ApiClient';
import { BankServiceInterface, BankDto } from '@/application/services/BankService';

export class BankApiAdapter implements BankServiceInterface {
  async getBankInfo(): Promise<BankDto | Error> {
    try {
      return await apiClient.get<BankDto>('/api/bank');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des informations bancaires');
    }
  }

  async updateInterestRate(newRate: number): Promise<BankDto | Error> {
    try {
      return await apiClient.put<BankDto>('/api/bank/interest-rate', { newRate });
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la mise à jour du taux');
    }
  }
}

