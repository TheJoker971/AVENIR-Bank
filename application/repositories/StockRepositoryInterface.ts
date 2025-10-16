import { StockEntity } from "domain/entities/StockEntity";
import { StockSymbol } from "domain/values/StockSymbol";

export interface StockRepositoryInterface {
  findById(id: number): Promise<StockEntity | null>;
  findBySymbol(symbol: StockSymbol): Promise<StockEntity | null>;
  findByName(name: string): Promise<StockEntity[]>;
  findAll(): Promise<StockEntity[]>;
  findActiveStocks(): Promise<StockEntity[]>;
  save(stock: StockEntity): Promise<void>;
  update(stock: StockEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  existsBySymbol(symbol: StockSymbol): Promise<boolean>;
  count(): Promise<number>;
}
