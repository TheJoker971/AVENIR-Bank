import { CreditRepositoryInterface } from "application/repositories/CreditRepositoryInterface";
import { CreditEntity } from "domain/entities/CreditEntity";

export class CreditRepositoryInMemory implements CreditRepositoryInterface {
  private credits: Map<number, CreditEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<CreditEntity | null> {
    const credit = this.credits.get(id);
    return credit || null;
  }

  async findByClientId(clientId: number): Promise<CreditEntity[]> {
    const credits: CreditEntity[] = [];
    for (const credit of this.credits.values()) {
      if (credit.getClientId() === clientId) {
        credits.push(credit);
      }
    }
    return credits;
  }

  async findActiveCredits(): Promise<CreditEntity[]> {
    const credits: CreditEntity[] = [];
    for (const credit of this.credits.values()) {
      if (credit.getStatus() === "ACTIVE") {
        credits.push(credit);
      }
    }
    return credits;
  }

  async findOverdueCredits(): Promise<CreditEntity[]> {
    const credits: CreditEntity[] = [];
    for (const credit of this.credits.values()) {
      if (credit.isOverdue()) {
        credits.push(credit);
      }
    }
    return credits;
  }

  async findPaidOffCredits(): Promise<CreditEntity[]> {
    const credits: CreditEntity[] = [];
    for (const credit of this.credits.values()) {
      if (credit.getStatus() === "PAID_OFF") {
        credits.push(credit);
      }
    }
    return credits;
  }

  async findByStatus(status: string): Promise<CreditEntity[]> {
    const credits: CreditEntity[] = [];
    for (const credit of this.credits.values()) {
      if (credit.getStatus() === status) {
        credits.push(credit);
      }
    }
    return credits;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CreditEntity[]> {
    const credits: CreditEntity[] = [];
    for (const credit of this.credits.values()) {
      const creditDate = credit.createdAt;
      if (creditDate >= startDate && creditDate <= endDate) {
        credits.push(credit);
      }
    }
    return credits;
  }

  async findAll(): Promise<CreditEntity[]> {
    return Array.from(this.credits.values());
  }

  async save(credit: CreditEntity): Promise<void> {
    const id = credit.id > 0 ? credit.id : this.nextId++;
    this.credits.set(credit.id, credit);
  }

  async update(credit: CreditEntity): Promise<void> {
    if (!this.credits.has(credit.id)) {
      throw new Error(`Crédit avec l'ID ${credit.id} introuvable`);
    }
    this.credits.set(credit.id, credit);
  }

  async delete(id: number): Promise<void> {
    if (!this.credits.has(id)) {
      throw new Error(`Crédit avec l'ID ${id} introuvable`);
    }
    this.credits.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.credits.has(id);
  }

  async countByStatus(status: string): Promise<number> {
    let count = 0;
    for (const credit of this.credits.values()) {
      if (credit.getStatus() === status) {
        count++;
      }
    }
    return count;
  }

  async countByClientId(clientId: number): Promise<number> {
    let count = 0;
    for (const credit of this.credits.values()) {
      if (credit.getClientId() === clientId) {
        count++;
      }
    }
    return count;
  }
}

