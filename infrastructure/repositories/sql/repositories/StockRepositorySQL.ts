import { Repository, DataSource } from "typeorm";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { StockEntity } from "domain/entities/StockEntity";
import { StockEntitySQL } from "../entities/StockEntitySQL";
import { StockSymbol } from "domain/values/StockSymbol";
import { StockMapper } from "../mappers/StockMapper";

export class StockRepositorySQL implements StockRepositoryInterface {
  private repository: Repository<StockEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(StockEntitySQL);
  }

  async findById(id: number): Promise<StockEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return StockMapper.toDomain(sqlEntity);
  }

  async findBySymbol(symbol: StockSymbol): Promise<StockEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { symbol: symbol.value } });
    if (!sqlEntity) return null;
    return StockMapper.toDomain(sqlEntity);
  }

  async findByName(name: string): Promise<StockEntity[]> {
    const sqlEntities = await this.repository
      .createQueryBuilder("stock")
      .where("stock.name LIKE :name", { name: `%${name}%` })
      .getMany();
    return sqlEntities.map(entity => StockMapper.toDomain(entity)).filter((e): e is StockEntity => e !== null);
  }

  async findAll(): Promise<StockEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => StockMapper.toDomain(entity)).filter((e): e is StockEntity => e !== null);
  }

  async findActiveStocks(): Promise<StockEntity[]> {
    // Toutes les actions sont considérées comme actives
    return this.findAll();
  }

  async save(stock: StockEntity): Promise<void> {
    const sqlEntity = StockMapper.toSQL(stock);
    await this.repository.save(sqlEntity);
  }

  async update(stock: StockEntity): Promise<void> {
    const sqlEntity = StockMapper.toSQL(stock);
    await this.repository.update({ id: stock.id }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsBySymbol(symbol: StockSymbol): Promise<boolean> {
    const count = await this.repository.count({ where: { symbol: symbol.value } });
    return count > 0;
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}

