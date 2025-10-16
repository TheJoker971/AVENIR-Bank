import { OperationEntity, OperationStatus } from "domain/entities/OperationEntity";

export interface OperationRepositoryInterface {
  findById(id: number): Promise<OperationEntity | null>;
  findByAccountIban(iban: string): Promise<OperationEntity[]>;
  findByStatus(status: OperationStatus): Promise<OperationEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<OperationEntity[]>;
  findPendingOperations(): Promise<OperationEntity[]>;
  findByClientId(clientId: number): Promise<OperationEntity[]>;
  findAll(): Promise<OperationEntity[]>;
  save(operation: OperationEntity): Promise<void>;
  update(operation: OperationEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  countByStatus(status: OperationStatus): Promise<number>;
}
