import { StockHoldingEntity } from "domain/entities/StockHoldingEntity";
import { StockSymbol } from "domain/values/StockSymbol";

export interface StockHoldingRepositoryInterface {
  findById(id: number): Promise<StockHoldingEntity | null>;
  findByClientId(clientId: number): Promise<StockHoldingEntity[]>;
  findByClientIdAndSymbol(clientId: number, symbol: StockSymbol): Promise<StockHoldingEntity | null>;
  findByStockSymbol(symbol: StockSymbol): Promise<StockHoldingEntity[]>;
  findAll(): Promise<StockHoldingEntity[]>;
  save(holding: StockHoldingEntity): Promise<void>;
  update(holding: StockHoldingEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
}

