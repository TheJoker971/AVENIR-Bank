import { Repository, DataSource } from "typeorm";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { OperationEntity, OperationStatus } from "domain/entities/OperationEntity";
import { OperationEntitySQL } from "../entities/OperationEntitySQL";
import { OperationMapper } from "../mappers/OperationMapper";

export class OperationRepositorySQL implements OperationRepositoryInterface {
  private repository: Repository<OperationEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(OperationEntitySQL);
  }

  async findById(id: number): Promise<OperationEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return OperationMapper.toDomain(sqlEntity);
  }

  async findByAccountIban(iban: string): Promise<OperationEntity[]> {
    const sqlEntities = await this.repository.find({
      where: [
        { senderIban: iban },
        { receiverIban: iban }
      ]
    });
    return sqlEntities.map(entity => OperationMapper.toDomain(entity)).filter((e): e is OperationEntity => e !== null);
  }

  async findByStatus(status: OperationStatus): Promise<OperationEntity[]> {
    const sqlEntities = await this.repository.find({ where: { status: status } });
    return sqlEntities.map(entity => OperationMapper.toDomain(entity)).filter((e): e is OperationEntity => e !== null);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<OperationEntity[]> {
    const sqlEntities = await this.repository
      .createQueryBuilder("operation")
      .where("operation.date >= :startDate", { startDate })
      .andWhere("operation.date <= :endDate", { endDate })
      .getMany();
    return sqlEntities.map(entity => OperationMapper.toDomain(entity)).filter((e): e is OperationEntity => e !== null);
  }

  async findPendingOperations(): Promise<OperationEntity[]> {
    return this.findByStatus("PENDING" as OperationStatus);
  }

  async findByClientId(clientId: number): Promise<OperationEntity[]> {
    // Note: OperationEntity ne stocke pas directement le clientId
    // Il faudrait faire une jointure avec les comptes
    // Pour l'instant, on retourne toutes les opérations
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => OperationMapper.toDomain(entity)).filter((e): e is OperationEntity => e !== null);
  }

  async findAll(): Promise<OperationEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => OperationMapper.toDomain(entity)).filter((e): e is OperationEntity => e !== null);
  }

  async save(operation: OperationEntity): Promise<void> {
    const sqlEntity = OperationMapper.toSQL(operation);
    await this.repository.save(sqlEntity);
  }

  async update(operation: OperationEntity): Promise<void> {
    const sqlEntity = OperationMapper.toSQL(operation);
    await this.repository.update({ id: operation.getId() }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async countByStatus(status: OperationStatus): Promise<number> {
    return await this.repository.count({ where: { status: status as string } });
  }
}

