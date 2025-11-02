/**
 * Adaptateur API pour les bénéficiaires - Infrastructure Layer
 */
import { apiClient } from './ApiClient';
import {
  BeneficiaryServiceInterface,
  CreateBeneficiaryData,
} from '@/application/services/BeneficiaryService';
import { BeneficiaryDto } from '@/shared/dto';

export class BeneficiaryApiAdapter implements BeneficiaryServiceInterface {
  async getBeneficiaries(userId: number): Promise<BeneficiaryDto[] | Error> {
    try {
      return await apiClient.get<BeneficiaryDto[]>('/api/beneficiaries');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des bénéficiaires');
    }
  }

  async createBeneficiary(data: CreateBeneficiaryData): Promise<BeneficiaryDto | Error> {
    try {
      return await apiClient.post<BeneficiaryDto>('/api/beneficiaries', data);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création du bénéficiaire');
    }
  }

  async deleteBeneficiary(beneficiaryId: number): Promise<void | Error> {
    try {
      await apiClient.delete(`/api/beneficiaries/${beneficiaryId}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression du bénéficiaire');
    }
  }
}

