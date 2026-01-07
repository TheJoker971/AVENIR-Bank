import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { OperationEntity, OperationStatus } from "domain/entities/OperationEntity";

export class OperationRepositoryInMemory implements OperationRepositoryInterface {
  private operations: Map<number, OperationEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<OperationEntity | null> {
    console.log(`🔎 Recherche de l'opération ID: ${id}`);
    const operation = this.operations.get(id);
    if (operation) {
      console.log(`✅ Opération ${id} trouvée`);
    } else {
      console.log(`❌ Opération ${id} non trouvée. Opérations disponibles:`, Array.from(this.operations.keys()));
    }
    return operation || null;
  }

  async findByAccountIban(iban: string): Promise<OperationEntity[]> {
    console.log(`🔍 Recherche des opérations pour IBAN: ${iban}`);
    console.log(`📊 Total opérations dans le repository: ${this.operations.size}`);
    
    const operations: OperationEntity[] = [];
    for (const operation of this.operations.values()) {
      const senderIban = operation.getSenderIban();
      const receiverIban = operation.getReceiverIban();
      
      console.log(`  - Op ${operation.getId()}: ${senderIban} → ${receiverIban}`);
      
      if (senderIban === iban || receiverIban === iban) {
        console.log(`    ✅ Match trouvé!`);
        operations.push(operation);
      }
    }
    
    console.log(`✅ ${operations.length} opération(s) trouvée(s) pour ${iban}`);
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
    // Si l'opération a déjà un ID valide (> 0), on l'utilise
    // Sinon on génère un nouvel ID
    const id = operation.getId() > 0 ? operation.getId() : this.nextId++;
    
    // Stocker l'opération avec son ID
    this.operations.set(id, operation);
    
    console.log(`💾 Opération sauvegardée avec ID ${id}. Total opérations: ${this.operations.size}`);
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

