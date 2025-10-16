import { BankEntity } from "domain/entities/BankEntity";
import { BankRepositoryInterface } from "application/repositories/BankRepositoryInterface";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { InterestRate } from "domain/values/InterestRate";

export class InMemoryBankRepository implements BankRepositoryInterface {
  private bank: BankEntity | null = null;
  private nextId: number = 1;

  async getCurrentBank(): Promise<BankEntity | null> {
    if (!this.bank) {
      // Initialiser la banque par défaut
      await this.initializeDefaultBank();
    }
    return this.bank;
  }

  async findById(id: number): Promise<BankEntity | null> {
    if (this.bank && this.bank === this.bank) { // Simple check pour la simulation
      return this.bank;
    }
    return null;
  }

  async save(bank: BankEntity): Promise<void> {
    this.bank = bank;
  }

  async update(bank: BankEntity): Promise<void> {
    this.bank = bank;
  }

  async delete(id: number): Promise<void> {
    this.bank = null;
  }

  async exists(id: number): Promise<boolean> {
    return this.bank !== null;
  }

  private async initializeDefaultBank(): Promise<void> {
    const bankCode = BankCode.create("12345");
    const branchCode = BranchCode.create("67890");
    const interestRate = InterestRate.create(2.5); // 2.5% par défaut

    if (bankCode instanceof Error || branchCode instanceof Error || interestRate instanceof Error) {
      throw new Error("Erreur lors de l'initialisation de la banque");
    }

    this.bank = BankEntity.create(
      "AVENIR Bank",
      "12345",
      "67890"
    );

    if (this.bank instanceof Error) {
      throw new Error("Erreur lors de la création de la banque");
    }
  }

  // Méthodes utilitaires pour les tests
  clear(): void {
    this.bank = null;
  }

  getCurrentInterestRate(): number {
    return this.bank?.interestRate.value || 0;
  }

  // Méthode pour initialiser avec des données de test
  async seedTestData(): Promise<void> {
    await this.initializeDefaultBank();
  }
}
