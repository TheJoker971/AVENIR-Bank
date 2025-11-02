/**
 * Repository In-Memory pour les bénéficiaires - Infrastructure Layer
 */
import { BeneficiaryRepositoryInterface } from "application/repositories/BeneficiaryRepositoryInterface";
import { BeneficiaryEntity } from "domain/entities/BeneficiaryEntity";

export class BeneficiaryRepositoryInMemory implements BeneficiaryRepositoryInterface {
  private beneficiaries: Map<number, BeneficiaryEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<BeneficiaryEntity | null> {
    return this.beneficiaries.get(id) || null;
  }

  async findByOwnerId(ownerId: number): Promise<BeneficiaryEntity[]> {
    const beneficiaries: BeneficiaryEntity[] = [];
    for (const beneficiary of this.beneficiaries.values()) {
      if (beneficiary.ownerId === ownerId) {
        beneficiaries.push(beneficiary);
      }
    }
    return beneficiaries;
  }

  async findByOwnerIdAndIban(ownerId: number, iban: string): Promise<BeneficiaryEntity | null> {
    for (const beneficiary of this.beneficiaries.values()) {
      if (beneficiary.ownerId === ownerId && beneficiary.iban === iban) {
        return beneficiary;
      }
    }
    return null;
  }

  async findAll(): Promise<BeneficiaryEntity[]> {
    return Array.from(this.beneficiaries.values());
  }

  async save(beneficiary: BeneficiaryEntity): Promise<void> {
    const id = beneficiary.id > 0 ? beneficiary.id : this.nextId++;
    if (id !== beneficiary.id) {
      // Créer une nouvelle instance avec le bon ID si nécessaire
      const newBeneficiary = BeneficiaryEntity.create(
        id,
        beneficiary.ownerId,
        beneficiary.name,
        beneficiary.iban
      );
      if (newBeneficiary instanceof Error) {
        throw new Error(newBeneficiary.message);
      }
      this.beneficiaries.set(id, newBeneficiary);
    } else {
      this.beneficiaries.set(beneficiary.id, beneficiary);
    }
  }

  async update(beneficiary: BeneficiaryEntity): Promise<void> {
    if (!this.beneficiaries.has(beneficiary.id)) {
      throw new Error(`Bénéficiaire avec l'ID ${beneficiary.id} introuvable`);
    }
    this.beneficiaries.set(beneficiary.id, beneficiary);
  }

  async delete(id: number): Promise<void> {
    if (!this.beneficiaries.has(id)) {
      throw new Error(`Bénéficiaire avec l'ID ${id} introuvable`);
    }
    this.beneficiaries.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.beneficiaries.has(id);
  }
}

