import { Repository, DataSource } from "typeorm";
import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";
import { NotificationEntity } from "domain/entities/NotificationEntity";
import { NotificationEntitySQL } from "../entities/NotificationEntitySQL";
import { NotificationMapper } from "../mappers/NotificationMapper";

export class NotificationRepositorySQL implements NotificationRepositoryInterface {
  private repository: Repository<NotificationEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(NotificationEntitySQL);
  }

  async findById(id: number): Promise<NotificationEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return NotificationMapper.toDomain(sqlEntity);
  }

  async findByRecipientId(recipientId: number): Promise<NotificationEntity[]> {
    const sqlEntities = await this.repository.find({ where: { recipientId } });
    return sqlEntities.map(entity => NotificationMapper.toDomain(entity)).filter((e): e is NotificationEntity => e !== null);
  }

  async findUnreadByRecipientId(recipientId: number): Promise<NotificationEntity[]> {
    const sqlEntities = await this.repository.find({ 
      where: { recipientId, isRead: false } 
    });
    return sqlEntities.map(entity => NotificationMapper.toDomain(entity)).filter((e): e is NotificationEntity => e !== null);
  }

  async findByType(type: string): Promise<NotificationEntity[]> {
    const sqlEntities = await this.repository.find({ where: { type } });
    return sqlEntities.map(entity => NotificationMapper.toDomain(entity)).filter((e): e is NotificationEntity => e !== null);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<NotificationEntity[]> {
    const sqlEntities = await this.repository
      .createQueryBuilder("notification")
      .where("notification.createdAt >= :startDate", { startDate })
      .andWhere("notification.createdAt <= :endDate", { endDate })
      .getMany();
    return sqlEntities.map(entity => NotificationMapper.toDomain(entity)).filter((e): e is NotificationEntity => e !== null);
  }

  async findAll(): Promise<NotificationEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => NotificationMapper.toDomain(entity)).filter((e): e is NotificationEntity => e !== null);
  }

  async save(notification: NotificationEntity): Promise<void> {
    const sqlEntity = NotificationMapper.toSQL(notification);
    await this.repository.save(sqlEntity);
  }

  async update(notification: NotificationEntity): Promise<void> {
    const sqlEntity = NotificationMapper.toSQL(notification);
    await this.repository.update({ id: notification.id }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async markAsRead(id: number): Promise<void> {
    await this.repository.update({ id }, { isRead: true });
  }

  async markAllAsRead(recipientId: number): Promise<void> {
    await this.repository.update({ recipientId, isRead: false }, { isRead: true });
  }

  async countUnreadByRecipientId(recipientId: number): Promise<number> {
    return await this.repository.count({ where: { recipientId, isRead: false } });
  }
}

