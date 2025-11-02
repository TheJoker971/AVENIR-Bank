import { AccountRepositoryInterface, SavingsAccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { AccountEntity } from "domain/entities/AccountEntity";
import { SavingsAccountEntity } from "domain/entities/SavingsAccountEntity";
import { Iban } from "domain/values/Iban";

export class AccountRepositoryInMemory implements AccountRepositoryInterface {
  private accounts: Map<number, AccountEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<AccountEntity | null> {
    const account = this.accounts.get(id);
    return account || null;
  }

  async findByIban(iban: Iban): Promise<AccountEntity | null> {
    for (const account of this.accounts.values()) {
      if (account.iban.value === iban.value) {
        return account;
      }
    }
    return null;
  }

  async findByOwnerId(ownerId: number): Promise<AccountEntity[]> {
    const accounts: AccountEntity[] = [];
    for (const account of this.accounts.values()) {
      if (account.ownerId === ownerId) {
        accounts.push(account);
      }
    }
    return accounts;
  }

  async findAll(): Promise<AccountEntity[]> {
    return Array.from(this.accounts.values());
  }

  async save(account: AccountEntity): Promise<void> {
    // Note: AccountEntity n'a pas d'ID, on utilise un système de tracking
    // Pour simplifier, on assume qu'on passe toujours une nouvelle instance
    const id = this.nextId++;
    // On ne peut pas directement modifier l'entité car elle est immuable
    // Cette implémentation nécessite que l'entité soit sauvegardée avec un système d'ID externe
    // Pour l'instant, on stocke avec un ID auto-incrémenté basé sur l'IBAN comme clé
    this.accounts.set(id, account);
  }

  async update(account: AccountEntity): Promise<void> {
    // Trouver le compte par IBAN car AccountEntity n'a pas d'ID direct
    for (const [id, existingAccount] of this.accounts.entries()) {
      if (existingAccount.iban.value === account.iban.value) {
        this.accounts.set(id, account);
        return;
      }
    }
    throw new Error(`Compte avec IBAN ${account.iban.value} introuvable`);
  }

  async delete(id: number): Promise<void> {
    if (!this.accounts.has(id)) {
      throw new Error(`Compte avec l'ID ${id} introuvable`);
    }
    this.accounts.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.accounts.has(id);
  }

  async findByOwnerIdAndType(ownerId: number, accountType: string): Promise<AccountEntity[]> {
    // Note: AccountEntity ne stocke pas explicitement le type, 
    // cette implémentation retourne tous les comptes de l'owner
    return this.findByOwnerId(ownerId);
  }
}

export class SavingsAccountRepositoryInMemory implements SavingsAccountRepositoryInterface {
  private savingsAccounts: Map<number, SavingsAccountEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<SavingsAccountEntity | null> {
    const account = this.savingsAccounts.get(id);
    return account || null;
  }

  async findByIban(iban: Iban): Promise<SavingsAccountEntity | null> {
    for (const account of this.savingsAccounts.values()) {
      if (account.iban.value === iban.value) {
        return account;
      }
    }
    return null;
  }

  async findByOwnerId(ownerId: number): Promise<SavingsAccountEntity[]> {
    const accounts: SavingsAccountEntity[] = [];
    for (const account of this.savingsAccounts.values()) {
      if (account.ownerId === ownerId) {
        accounts.push(account);
      }
    }
    return accounts;
  }

  async findAll(): Promise<SavingsAccountEntity[]> {
    return Array.from(this.savingsAccounts.values());
  }

  async save(savingsAccount: SavingsAccountEntity): Promise<void> {
    const id = savingsAccount.id > 0 ? savingsAccount.id : this.nextId++;
    // Comme l'entité est immuable, on doit créer une nouvelle instance avec l'ID
    // Pour simplifier, on assume que l'entité a déjà un ID valide
    this.savingsAccounts.set(savingsAccount.id, savingsAccount);
  }

  async update(savingsAccount: SavingsAccountEntity): Promise<void> {
    if (!this.savingsAccounts.has(savingsAccount.id)) {
      throw new Error(`Compte d'épargne avec l'ID ${savingsAccount.id} introuvable`);
    }
    this.savingsAccounts.set(savingsAccount.id, savingsAccount);
  }

  async delete(id: number): Promise<void> {
    if (!this.savingsAccounts.has(id)) {
      throw new Error(`Compte d'épargne avec l'ID ${id} introuvable`);
    }
    this.savingsAccounts.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.savingsAccounts.has(id);
  }

  async findAllForInterestCalculation(): Promise<SavingsAccountEntity[]> {
    return Array.from(this.savingsAccounts.values());
  }

  async findByInterestRate(interestRate: number): Promise<SavingsAccountEntity[]> {
    const accounts: SavingsAccountEntity[] = [];
    for (const account of this.savingsAccounts.values()) {
      if (account.interestRate.value === interestRate) {
        accounts.push(account);
      }
    }
    return accounts;
  }
}

