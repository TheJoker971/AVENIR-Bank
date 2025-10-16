import { OrderEntity } from "domain/entities/OrderEntity";
import { StockSymbol } from "domain/values/StockSymbol";
import { OrderStatus } from "domain/values/OrderStatus";

export interface OrderRepositoryInterface {
  findById(id: number): Promise<OrderEntity | null>;
  findByClientId(clientId: number): Promise<OrderEntity[]>;
  findByStockSymbol(symbol: StockSymbol): Promise<OrderEntity[]>;
  findByStatus(status: OrderStatus): Promise<OrderEntity[]>;
  findPendingOrders(): Promise<OrderEntity[]>;
  findExecutedOrders(): Promise<OrderEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<OrderEntity[]>;
  findAll(): Promise<OrderEntity[]>;
  save(order: OrderEntity): Promise<void>;
  update(order: OrderEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  countByStatus(status: OrderStatus): Promise<number>;
  countByClientId(clientId: number): Promise<number>;
}
