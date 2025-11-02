import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { OperationEntity, OperationStatus } from "domain/entities/OperationEntity";

export class OperationRepositoryInMemory implements OperationRepositoryInterface {
  private operations: Map<number, OperationEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<OperationEntity | null> {
    const operation = this.operations.get(id);
    return operation || null;
  }

  async findByAccountIban(iban: string): Promise<OperationEntity[]> {
    const operations: OperationEntity[] = [];
    for (const operation of this.operations.values()) {
      if (operation.getSenderIban() === iban || operation.getReceiverIban() === iban) {
        operations.push(operation);
      }
    }
    return operations;
  }

  async findByStatus(status: OperationStatus): Promise<OperationEntity[]> {
    const operations: OperationEntity[] = [];
    for (const operation of this.operations.values()) {
      if (operation.getStatus() === status) {
        operations.push(operation);
      }
    }
    return operations;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<OperationEntity[]> {
    const operations: OperationEntity[] = [];
    for (const operation of this.operations.values()) {
      const opDate = operation.getDate();
      if (opDate >= startDate && opDate <= endDate) {
        operations.push(operation);
      }
    }
    return operations;
  }

  async findPendingOperations(): Promise<OperationEntity[]> {
    return this.findByStatus("PENDING");
  }

  async findByClientId(clientId: number): Promise<OperationEntity[]> {
    // Note: OperationEntity ne stocke pas directement le clientId
    // Cette implémentation nécessite une relation via les comptes
    // Pour l'instant, on retourne toutes les opérations
    // TODO: Implémenter la relation client-compte pour filtrer correctement
    return Array.from(this.operations.values());
  }

  async findAll(): Promise<OperationEntity[]> {
    return Array.from(this.operations.values());
  }

  async save(operation: OperationEntity): Promise<void> {
    const id = operation.getId() > 0 ? operation.getId() : this.nextId++;
    if (id !== operation.getId()) {
      // On ne peut pas modifier l'ID d'une entité immuable
      // On doit créer une nouvelle entité avec le nouvel ID
      // Pour l'instant, on assume que l'entité a déjà un ID valide
      this.operations.set(operation.getId(), operation);
    } else {
      this.operations.set(id, operation);
    }
  }

  async update(operation: OperationEntity): Promise<void> {
    if (!this.operations.has(operation.getId())) {
      throw new Error(`Opération avec l'ID ${operation.getId()} introuvable`);
    }
    this.operations.set(operation.getId(), operation);
  }

  async delete(id: number): Promise<void> {
    if (!this.operations.has(id)) {
      throw new Error(`Opération avec l'ID ${id} introuvable`);
    }
    this.operations.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.operations.has(id);
  }

  async countByStatus(status: OperationStatus): Promise<number> {
    let count = 0;
    for (const operation of this.operations.values()) {
      if (operation.getStatus() === status) {
        count++;
      }
    }
    return count;
  }
}

