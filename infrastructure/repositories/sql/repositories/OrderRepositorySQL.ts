import { Repository, DataSource } from "typeorm";
import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { OrderEntity } from "domain/entities/OrderEntity";
import { OrderEntitySQL } from "../entities/OrderEntitySQL";
import { StockSymbol } from "domain/values/StockSymbol";
import { OrderStatus } from "domain/values/OrderStatus";
import { OrderMapper } from "../mappers/OrderMapper";

export class OrderRepositorySQL implements OrderRepositoryInterface {
  private repository: Repository<OrderEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(OrderEntitySQL);
  }

  async findById(id: number): Promise<OrderEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return OrderMapper.toDomain(sqlEntity);
  }

  async findByClientId(clientId: number): Promise<OrderEntity[]> {
    const sqlEntities = await this.repository.find({ where: { clientId } });
    return sqlEntities.map(entity => OrderMapper.toDomain(entity)).filter((e): e is OrderEntity => e !== null);
  }

  async findByStockSymbol(symbol: StockSymbol): Promise<OrderEntity[]> {
    const sqlEntities = await this.repository.find({ where: { stockSymbol: symbol.value } });
    return sqlEntities.map(entity => OrderMapper.toDomain(entity)).filter((e): e is OrderEntity => e !== null);
  }

  async findByStatus(status: OrderStatus): Promise<OrderEntity[]> {
    const sqlEntities = await this.repository.find({ where: { status: status.value } });
    return sqlEntities.map(entity => OrderMapper.toDomain(entity)).filter((e): e is OrderEntity => e !== null);
  }

  async findPendingOrders(): Promise<OrderEntity[]> {
    return this.findByStatus(OrderStatus.pending());
  }

  async findExecutedOrders(): Promise<OrderEntity[]> {
    return this.findByStatus(OrderStatus.executed());
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<OrderEntity[]> {
    const sqlEntities = await this.repository
      .createQueryBuilder("order")
      .where("order.createdAt >= :startDate", { startDate })
      .andWhere("order.createdAt <= :endDate", { endDate })
      .getMany();
    return sqlEntities.map(entity => OrderMapper.toDomain(entity)).filter((e): e is OrderEntity => e !== null);
  }

  async findAll(): Promise<OrderEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => OrderMapper.toDomain(entity)).filter((e): e is OrderEntity => e !== null);
  }

  async save(order: OrderEntity): Promise<void> {
    const sqlEntity = OrderMapper.toSQL(order);
    await this.repository.save(sqlEntity);
  }

  async update(order: OrderEntity): Promise<void> {
    const sqlEntity = OrderMapper.toSQL(order);
    await this.repository.update({ id: order.id }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async countByStatus(status: OrderStatus): Promise<number> {
    return await this.repository.count({ where: { status: status.value } });
  }

  async countByClientId(clientId: number): Promise<number> {
    return await this.repository.count({ where: { clientId } });
  }
}

