import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { OrderEntity } from "domain/entities/OrderEntity";
import { StockSymbol } from "domain/values/StockSymbol";
import { OrderStatus } from "domain/values/OrderStatus";

export class OrderRepositoryInMemory implements OrderRepositoryInterface {
  private orders: Map<number, OrderEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<OrderEntity | null> {
    const order = this.orders.get(id);
    return order || null;
  }

  async findByClientId(clientId: number): Promise<OrderEntity[]> {
    const orders: OrderEntity[] = [];
    for (const order of this.orders.values()) {
      if (order.getClientId() === clientId) {
        orders.push(order);
      }
    }
    return orders;
  }

  async findByStockSymbol(symbol: StockSymbol): Promise<OrderEntity[]> {
    const orders: OrderEntity[] = [];
    for (const order of this.orders.values()) {
      if (order.getStockSymbol().value === symbol.value) {
        orders.push(order);
      }
    }
    return orders;
  }

  async findByStatus(status: OrderStatus): Promise<OrderEntity[]> {
    const orders: OrderEntity[] = [];
    for (const order of this.orders.values()) {
      if (order.status.value === status.value) {
        orders.push(order);
      }
    }
    return orders;
  }

  async findPendingOrders(): Promise<OrderEntity[]> {
    const pendingStatus = OrderStatus.pending();
    return this.findByStatus(pendingStatus);
  }

  async findExecutedOrders(): Promise<OrderEntity[]> {
    const executedStatus = OrderStatus.executed();
    return this.findByStatus(executedStatus);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<OrderEntity[]> {
    const orders: OrderEntity[] = [];
    for (const order of this.orders.values()) {
      const orderDate = order.createdAt;
      if (orderDate >= startDate && orderDate <= endDate) {
        orders.push(order);
      }
    }
    return orders;
  }

  async findAll(): Promise<OrderEntity[]> {
    return Array.from(this.orders.values());
  }

  async save(order: OrderEntity): Promise<void> {
    const id = order.id > 0 ? order.id : this.nextId++;
    this.orders.set(order.id, order);
  }

  async update(order: OrderEntity): Promise<void> {
    if (!this.orders.has(order.id)) {
      throw new Error(`Ordre avec l'ID ${order.id} introuvable`);
    }
    this.orders.set(order.id, order);
  }

  async delete(id: number): Promise<void> {
    if (!this.orders.has(id)) {
      throw new Error(`Ordre avec l'ID ${id} introuvable`);
    }
    this.orders.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.orders.has(id);
  }

  async countByStatus(status: OrderStatus): Promise<number> {
    let count = 0;
    for (const order of this.orders.values()) {
      if (order.status.getValue() === status.getValue()) {
        count++;
      }
    }
    return count;
  }

  async countByClientId(clientId: number): Promise<number> {
    let count = 0;
    for (const order of this.orders.values()) {
      if (order.getClientId() === clientId) {
        count++;
      }
    }
    return count;
  }
}

