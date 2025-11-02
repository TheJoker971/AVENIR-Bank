import { BankRepositoryInterface } from "application/repositories/BankRepositoryInterface";
import { BankEntity } from "domain/entities/BankEntity";

export class BankRepositoryInMemory implements BankRepositoryInterface {
  private bank: BankEntity | null = null;

  async getCurrentBank(): Promise<BankEntity | null> {
    return this.bank;
  }

  async findById(id: number): Promise<BankEntity | null> {
    // Pour simplifier, on n'a qu'une seule banque, donc l'ID est ignoré
    return this.bank;
  }

  async save(bank: BankEntity): Promise<void | Error> {
    this.bank = bank;
  }

  async update(bank: BankEntity): Promise<void | Error> {
    if (!this.bank) {
      return new Error("Aucune banque n'existe encore");
    }
    this.bank = bank;
  }

  async delete(id: number): Promise<void> {
    this.bank = null;
  }

  async exists(id: number): Promise<boolean> {
    return this.bank !== null;
  }
}

