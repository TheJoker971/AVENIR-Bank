import { AccountEntity } from "domain/entities/AccountEntity";
import { SavingsAccountEntity } from "domain/entities/SavingsAccountEntity";
import { Iban } from "domain/values/Iban";

export interface AccountRepositoryInterface {
  findById(id: number): Promise<AccountEntity | null>;
  findByIban(iban: Iban): Promise<AccountEntity | null>;
  findByOwnerId(ownerId: number): Promise<AccountEntity[]>;
  findAll(): Promise<AccountEntity[]>;
  save(account: AccountEntity): Promise<void>;
  update(account: AccountEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  findByOwnerIdAndType(ownerId: number, accountType: string): Promise<AccountEntity[]>;
}

export interface SavingsAccountRepositoryInterface {
  findById(id: number): Promise<SavingsAccountEntity | null>;
  findByIban(iban: Iban): Promise<SavingsAccountEntity | null>;
  findByOwnerId(ownerId: number): Promise<SavingsAccountEntity[]>;
  findAll(): Promise<SavingsAccountEntity[]>;
  save(savingsAccount: SavingsAccountEntity): Promise<void>;
  update(savingsAccount: SavingsAccountEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  findAllForInterestCalculation(): Promise<SavingsAccountEntity[]>;
  findByInterestRate(interestRate: number): Promise<SavingsAccountEntity[]>;
}
