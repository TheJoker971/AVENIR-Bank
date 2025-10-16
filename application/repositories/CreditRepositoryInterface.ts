import { CreditEntity } from "domain/entities/CreditEntity";

export interface CreditRepositoryInterface {
  findById(id: number): Promise<CreditEntity | null>;
  findByClientId(clientId: number): Promise<CreditEntity[]>;
  findActiveCredits(): Promise<CreditEntity[]>;
  findOverdueCredits(): Promise<CreditEntity[]>;
  findPaidOffCredits(): Promise<CreditEntity[]>;
  findByStatus(status: string): Promise<CreditEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<CreditEntity[]>;
  findAll(): Promise<CreditEntity[]>;
  save(credit: CreditEntity): Promise<void>;
  update(credit: CreditEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  countByStatus(status: string): Promise<number>;
  countByClientId(clientId: number): Promise<number>;
}
