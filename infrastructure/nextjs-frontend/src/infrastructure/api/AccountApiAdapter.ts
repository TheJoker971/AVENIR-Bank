/**
 * Adaptateur API pour les comptes - Infrastructure Layer
 */
import { apiClient } from './ApiClient';
import {
  AccountServiceInterface,
  CreateAccountData,
  TransferData,
} from '@/application/services/AccountService';
import { AccountDto, OperationDto, SavingsAccountDto } from '@/shared/dto';

export class AccountApiAdapter implements AccountServiceInterface {
  async getAccounts(userId: number): Promise<AccountDto[] | Error> {
    try {
      return await apiClient.get<AccountDto[]>(`/users/${userId}/accounts`);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la récupération des comptes');
    }
  }

  async createAccount(data: CreateAccountData): Promise<AccountDto | Error> {
    try {
      return await apiClient.post<AccountDto>('/accounts', data);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la création du compte');
    }
  }

  async deleteAccount(accountId: number): Promise<void | Error> {
    try {
      await apiClient.delete(`/accounts/${accountId}`);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la suppression du compte');
    }
  }

  async updateAccountName(accountId: number, name: string): Promise<AccountDto | Error> {
    try {
      return await apiClient.put<AccountDto>(`/accounts/${accountId}`, { name });
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la modification du compte');
    }
  }

  async getAccountOperations(accountId: number): Promise<OperationDto[] | Error> {
    try {
      return await apiClient.get<OperationDto[]>(`/accounts/${accountId}/operations`);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la récupération des opérations');
    }
  }

  async transfer(data: TransferData): Promise<void | Error> {
    try {
      await apiClient.post('/operations/transfer', data);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors du virement');
    }
  }

  async getSavingsAccounts(userId: number): Promise<SavingsAccountDto[] | Error> {
    try {
      return await apiClient.get<SavingsAccountDto[]>(`/users/${userId}/savings-accounts`);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la récupération des livrets');
    }
  }

  async createSavingsAccount(userId: number): Promise<SavingsAccountDto | Error> {
    try {
      return await apiClient.post<SavingsAccountDto>('/savings-accounts', { userId });
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la création du livret');
    }
  }
}

