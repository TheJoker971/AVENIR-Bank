import { BankEntity } from "domain/entities/BankEntity";

export interface BankRepositoryInterface {
  getCurrentBank(): Promise<BankEntity | null>;
  findById(id: number): Promise<BankEntity | null>;
  save(bank: BankEntity): Promise<void | Error>;
  update(bank: BankEntity): Promise<void | Error>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
}

