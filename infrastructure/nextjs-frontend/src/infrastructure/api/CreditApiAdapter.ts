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
      return await apiClient.post<CreditDto>('/api/credits', data);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création du crédit');
    }
  }

  async getUserCredits(userId: number): Promise<CreditDto[] | Error> {
    try {
      // Pour les conseillers, on récupère tous les crédits
      // Pour les clients, on filtre par userId côté front-end ou on utilise un endpoint spécifique
      return await apiClient.get<CreditDto[]>('/api/credits');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des crédits');
    }
  }

  async processPayment(creditId: number, accountId: number): Promise<void | Error> {
    try {
      await apiClient.post(`/api/credits/${creditId}/payments`, { accountId });
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du traitement du paiement');
    }
  }
}

