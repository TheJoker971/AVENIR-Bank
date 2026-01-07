/**
 * Service de gestion des comptes - Application Layer
 */
import { AccountDto, OperationDto, SavingsAccountDto } from '@/shared/dto';

export interface CreateAccountData {
  name: string;
  userId: number;
}

export interface TransferData {
  fromAccountId: number;
  toAccountId?: number; // Optionnel si c'est un virement vers bénéficiaire
  receiverIban?: string; // IBAN du compte bénéficiaire (si virement externe)
  receiverName?: string; // Nom du bénéficiaire (si virement externe)
  amount: number;
  description: string;
}

export interface AccountServiceInterface {
  getAccounts(userId: number): Promise<AccountDto[] | Error>;
  getAccountsByOwner(ownerId: number): Promise<AccountDto[] | Error>;
  createAccount(data: CreateAccountData): Promise<AccountDto | Error>;
  deleteAccount(accountId: number): Promise<void | Error>;
  updateAccountName(accountId: number, name: string): Promise<AccountDto | Error>;
  getAccountOperations(accountId: number): Promise<OperationDto[] | Error>;
  transfer(data: TransferData): Promise<void | Error>;
  getSavingsAccounts(userId: number): Promise<SavingsAccountDto[] | Error>;
  createSavingsAccount(userId: number): Promise<SavingsAccountDto | Error>;
}

