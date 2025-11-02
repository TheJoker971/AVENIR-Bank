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
      return await apiClient.get<AccountDto[]>('/api/accounts');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des comptes');
    }
  }

  async getAccountsByOwner(ownerId: number): Promise<AccountDto[] | Error> {
    try {
      return await apiClient.get<AccountDto[]>(`/api/accounts/by-owner/${ownerId}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des comptes');
    }
  }

  async createAccount(data: CreateAccountData): Promise<AccountDto | Error> {
    try {
      // Le backend génère automatiquement le numéro de compte et l'IBAN
      // On envoie seulement l'ownerId, le backend utilisera les valeurs par défaut
      return await apiClient.post<AccountDto>('/api/accounts', { 
        ownerId: data.userId 
        // Les autres paramètres (countryCode, bankCode, branchCode, ribKey) 
        // sont optionnels et utilisent les valeurs par défaut de la banque
      });
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création du compte');
    }
  }

  async deleteAccount(accountId: number): Promise<void | Error> {
    try {
      await apiClient.delete(`/api/accounts/${accountId}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression du compte');
    }
  }

  async updateAccountName(accountId: number, name: string): Promise<AccountDto | Error> {
    try {
      return await apiClient.put<AccountDto>(`/api/accounts/${accountId}`, { name });
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la modification du compte');
    }
  }

  async getAccountOperations(accountId: number): Promise<OperationDto[] | Error> {
    try {
      return await apiClient.get<OperationDto[]>(`/api/accounts/${accountId}/operations`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des opérations');
    }
  }

  async transfer(data: TransferData): Promise<void | Error> {
    try {
      // Le front-end doit passer les IBANs directement
      if (!data.receiverIban) {
        return new Error('IBAN du destinataire manquant');
      }

      // Récupérer les comptes pour obtenir l'IBAN de l'émetteur
      const accounts = await this.getAccounts(0); // L'API retourne les comptes de l'utilisateur connecté
      if (accounts instanceof Error) {
        return accounts;
      }
      
      const fromAccount = accounts.find(a => a.id === data.fromAccountId);
      if (!fromAccount) {
        return new Error('Compte émetteur non trouvé');
      }

      // Préparer les données pour l'API
      const transferPayload: any = {
        senderIban: fromAccount.iban,
        receiverIban: data.receiverIban,
        amount: data.amount,
        reason: data.description || '',
        instantTransfer: true,
      };

      // Ajouter le nom du bénéficiaire si fourni (pour les virements externes)
      if (data.receiverName) {
        const nameParts = data.receiverName.split(' ');
        transferPayload.receiverFirstName = nameParts[0] || data.receiverName;
        transferPayload.receiverLastName = nameParts.slice(1).join(' ') || '';
      }

      await apiClient.post('/api/operations/transfer', transferPayload);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du virement');
    }
  }

  async getSavingsAccounts(userId: number): Promise<SavingsAccountDto[] | Error> {
    try {
      return await apiClient.get<SavingsAccountDto[]>('/api/savings-accounts');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des livrets');
    }
  }

  async createSavingsAccount(userId: number): Promise<SavingsAccountDto | Error> {
    try {
      return await apiClient.post<SavingsAccountDto>('/api/savings-accounts', { userId });
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création du livret');
    }
  }
}

