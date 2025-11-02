import { Repository, DataSource } from "typeorm";
import { CreditRepositoryInterface } from "application/repositories/CreditRepositoryInterface";
import { CreditEntity } from "domain/entities/CreditEntity";
import { CreditEntitySQL } from "../entities/CreditEntitySQL";
import { CreditMapper } from "../mappers/CreditMapper";

export class CreditRepositorySQL implements CreditRepositoryInterface {
  private repository: Repository<CreditEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(CreditEntitySQL);
  }

  async findById(id: number): Promise<CreditEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return CreditMapper.toDomain(sqlEntity);
  }

  async findByClientId(clientId: number): Promise<CreditEntity[]> {
    const sqlEntities = await this.repository.find({ where: { clientId } });
    return sqlEntities.map(entity => CreditMapper.toDomain(entity)).filter((e): e is CreditEntity => e !== null);
  }

  async findActiveCredits(): Promise<CreditEntity[]> {
    const sqlEntities = await this.repository.find({ where: { status: "ACTIVE" } });
    return sqlEntities.map(entity => CreditMapper.toDomain(entity)).filter((e): e is CreditEntity => e !== null);
  }

  async findOverdueCredits(): Promise<CreditEntity[]> {
    const sqlEntities = await this.repository.find({ where: { status: "ACTIVE" } });
    // Filtrer ceux qui sont en retard (nextPaymentDate < today)
    const today = new Date();
    return sqlEntities
      .filter(entity => new Date(entity.nextPaymentDate) < today)
      .map(entity => CreditMapper.toDomain(entity))
      .filter((e): e is CreditEntity => e !== null);
  }

  async findPaidOffCredits(): Promise<CreditEntity[]> {
    const sqlEntities = await this.repository.find({ where: { status: "PAID_OFF" } });
    return sqlEntities.map(entity => CreditMapper.toDomain(entity)).filter((e): e is CreditEntity => e !== null);
  }

  async findByStatus(status: string): Promise<CreditEntity[]> {
    const sqlEntities = await this.repository.find({ where: { status } });
    return sqlEntities.map(entity => CreditMapper.toDomain(entity)).filter((e): e is CreditEntity => e !== null);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CreditEntity[]> {
    const sqlEntities = await this.repository
      .createQueryBuilder("credit")
      .where("credit.createdAt >= :startDate", { startDate })
      .andWhere("credit.createdAt <= :endDate", { endDate })
      .getMany();
    return sqlEntities.map(entity => CreditMapper.toDomain(entity)).filter((e): e is CreditEntity => e !== null);
  }

  async findAll(): Promise<CreditEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => CreditMapper.toDomain(entity)).filter((e): e is CreditEntity => e !== null);
  }

  async save(credit: CreditEntity): Promise<void> {
    const sqlEntity = CreditMapper.toSQL(credit);
    await this.repository.save(sqlEntity);
  }

  async update(credit: CreditEntity): Promise<void> {
    const sqlEntity = CreditMapper.toSQL(credit);
    await this.repository.update({ id: credit.id }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async countByStatus(status: string): Promise<number> {
    return await this.repository.count({ where: { status } });
  }

  async countByClientId(clientId: number): Promise<number> {
    return await this.repository.count({ where: { clientId } });
  }
}

