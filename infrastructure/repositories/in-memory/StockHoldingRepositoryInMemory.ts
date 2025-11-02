import { StockHoldingRepositoryInterface } from "application/repositories/StockHoldingRepositoryInterface";
import { StockHoldingEntity } from "domain/entities/StockHoldingEntity";
import { StockSymbol } from "domain/values/StockSymbol";

export class StockHoldingRepositoryInMemory implements StockHoldingRepositoryInterface {
  private holdings: Map<number, StockHoldingEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<StockHoldingEntity | null> {
    return this.holdings.get(id) || null;
  }

  async findByClientId(clientId: number): Promise<StockHoldingEntity[]> {
    const clientHoldings: StockHoldingEntity[] = [];
    for (const holding of this.holdings.values()) {
      if (holding.getClientId() === clientId && holding.getQuantity() > 0) {
        clientHoldings.push(holding);
      }
    }
    return clientHoldings;
  }

  async findByClientIdAndSymbol(clientId: number, symbol: StockSymbol): Promise<StockHoldingEntity | null> {
    for (const holding of this.holdings.values()) {
      if (
        holding.getClientId() === clientId &&
        holding.getStockSymbol().value === symbol.value
      ) {
        return holding;
      }
    }
    return null;
  }

  async findByStockSymbol(symbol: StockSymbol): Promise<StockHoldingEntity[]> {
    const holdings: StockHoldingEntity[] = [];
    for (const holding of this.holdings.values()) {
      if (holding.getStockSymbol().value === symbol.value && holding.getQuantity() > 0) {
        holdings.push(holding);
      }
    }
    return holdings;
  }

  async findAll(): Promise<StockHoldingEntity[]> {
    return Array.from(this.holdings.values());
  }

  async save(holding: StockHoldingEntity): Promise<void> {
    let holdingId = holding.id;

    if (holdingId <= 0 || !this.holdings.has(holdingId)) {
      holdingId = this.nextId++;
    }

    // Vérifier s'il existe déjà une possession pour ce client et ce symbole
    const existing = await this.findByClientIdAndSymbol(
      holding.getClientId(),
      holding.getStockSymbol()
    );

    if (existing && existing.id !== holdingId) {
      // Si une possession existe déjà, on l'update au lieu de créer une nouvelle
      // Utiliser la méthode create pour créer une nouvelle instance avec l'ID existant
      const holdingOrError = StockHoldingEntity.create(
        existing.id,
        holding.getClientId(),
        holding.getStockSymbol(),
        holding.getQuantity(),
        holding.getAveragePurchasePrice()
      );
      if (holdingOrError instanceof Error) {
        throw holdingOrError;
      }
      const updated = new StockHoldingEntity(
        existing.id,
        holding.getClientId(),
        holding.getStockSymbol(),
        holding.getQuantity(),
        holding.getAveragePurchasePrice(),
        existing.createdAt,
        new Date()
      );
      this.holdings.set(existing.id, updated);
      return;
    }

    const holdingToSave = holdingId !== holding.id
      ? StockHoldingEntity.create(
          holdingId,
          holding.getClientId(),
          holding.getStockSymbol(),
          holding.getQuantity(),
          holding.getAveragePurchasePrice()
        )
      : holding;

    if (holdingToSave instanceof Error) {
      throw holdingToSave;
    }

    this.holdings.set(holdingId, holdingToSave);
  }

  async update(holding: StockHoldingEntity): Promise<void> {
    if (!this.holdings.has(holding.id)) {
      throw new Error(`StockHolding with ID ${holding.id} not found`);
    }
    this.holdings.set(holding.id, holding);
  }

  async delete(id: number): Promise<void> {
    if (!this.holdings.has(id)) {
      throw new Error(`StockHolding with ID ${id} not found`);
    }
    this.holdings.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.holdings.has(id);
  }
}

