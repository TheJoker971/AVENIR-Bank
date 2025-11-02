import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { StockEntity } from "domain/entities/StockEntity";
import { StockSymbol } from "domain/values/StockSymbol";

export class StockRepositoryInMemory implements StockRepositoryInterface {
  private stocks: Map<number, StockEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<StockEntity | null> {
    const stock = this.stocks.get(id);
    return stock || null;
  }

  async findBySymbol(symbol: StockSymbol): Promise<StockEntity | null> {
    for (const stock of this.stocks.values()) {
      if (stock.symbol.value === symbol.value) {
        return stock;
      }
    }
    return null;
  }

  async findByName(name: string): Promise<StockEntity[]> {
    const stocks: StockEntity[] = [];
    for (const stock of this.stocks.values()) {
      if (stock.name.toLowerCase().includes(name.toLowerCase())) {
        stocks.push(stock);
      }
    }
    return stocks;
  }

  async findAll(): Promise<StockEntity[]> {
    return Array.from(this.stocks.values());
  }

  async findActiveStocks(): Promise<StockEntity[]> {
    // Toutes les actions sont considérées comme actives
    return Array.from(this.stocks.values());
  }

  async save(stock: StockEntity): Promise<void> {
    const id = stock.id > 0 ? stock.id : this.nextId++;
    if (id !== stock.id && stock.id <= 0) {
      // L'entité est immuable, on doit créer une nouvelle instance
      // Pour simplifier, on assume que l'entité a déjà un ID valide
      this.stocks.set(stock.id, stock);
    } else {
      this.stocks.set(stock.id, stock);
    }
  }

  async update(stock: StockEntity): Promise<void> {
    if (!this.stocks.has(stock.id)) {
      throw new Error(`Action avec l'ID ${stock.id} introuvable`);
    }
    this.stocks.set(stock.id, stock);
  }

  async delete(id: number): Promise<void> {
    if (!this.stocks.has(id)) {
      throw new Error(`Action avec l'ID ${id} introuvable`);
    }
    this.stocks.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.stocks.has(id);
  }

  async existsBySymbol(symbol: StockSymbol): Promise<boolean> {
    return (await this.findBySymbol(symbol)) !== null;
  }

  async count(): Promise<number> {
    return this.stocks.size;
  }
}

