/**
 * Adaptateur API pour les crédits - Infrastructure Layer
 */
import { apiClient } from './ApiClient';
import {
  CreditServiceInterface,
  CreateCreditData,
} from '@/application/services/CreditService';
import { CreditDto } from '@/shared/dto';

export class CreditApiAdapter implements CreditServiceInterface {
  async createCredit(data: CreateCreditData): Promise<CreditDto | Error> {
    try {
      return await apiClient.post<CreditDto>('/credits', data);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la création du crédit');
    }
  }

  async getUserCredits(userId: number): Promise<CreditDto[] | Error> {
    try {
      return await apiClient.get<CreditDto[]>(`/users/${userId}/credits`);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la récupération des crédits');
    }
  }

  async processPayment(creditId: number, accountId: number): Promise<void | Error> {
    try {
      await apiClient.post(`/credits/${creditId}/payments`, { accountId });
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors du traitement du paiement');
    }
  }
}

