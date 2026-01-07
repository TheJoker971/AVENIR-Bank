/**
 * Interface du repository pour les bénéficiaires - Application Layer
 */
import { BeneficiaryEntity } from "domain/entities/BeneficiaryEntity";

export interface BeneficiaryRepositoryInterface {
  findById(id: number): Promise<BeneficiaryEntity | null>;
  findByOwnerId(ownerId: number): Promise<BeneficiaryEntity[]>;
  findByOwnerIdAndIban(ownerId: number, iban: string): Promise<BeneficiaryEntity | null>;
  findAll(): Promise<BeneficiaryEntity[]>;
  save(beneficiary: BeneficiaryEntity): Promise<void>;
  update(beneficiary: BeneficiaryEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
}

