import { apiClient } from './ApiClient';
import { SavingsAccountServiceInterface } from '@/application/services/SavingsAccountService';
import { SavingsAccountTotalValueDto } from '@/shared/dto';

export class SavingsAccountApiAdapter implements SavingsAccountServiceInterface {
  async getTotalValue(savingsAccountId: number): Promise<SavingsAccountTotalValueDto | Error> {
    try {
      return await apiClient.get<SavingsAccountTotalValueDto>(`/api/savings-accounts/${savingsAccountId}/total-value`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du calcul de la valeur totale');
    }
  }
}

