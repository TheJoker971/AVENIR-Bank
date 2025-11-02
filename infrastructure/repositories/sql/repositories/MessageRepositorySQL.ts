import { Repository, DataSource } from "typeorm";
import { MessageRepositoryInterface } from "application/repositories/MessageRepositoryInterface";
import { MessageEntity } from "domain/entities/MessageEntity";
import { MessageEntitySQL } from "../entities/MessageEntitySQL";
import { MessageMapper } from "../mappers/MessageMapper";

export class MessageRepositorySQL implements MessageRepositoryInterface {
  private repository: Repository<MessageEntitySQL>;
  private advisorAssignments: Map<number, number> = new Map(); // messageId -> advisorId

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(MessageEntitySQL);
  }

  async findById(id: number): Promise<MessageEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return MessageMapper.toDomain(sqlEntity);
  }

  async findBySenderId(senderId: number): Promise<MessageEntity[]> {
    const sqlEntities = await this.repository.find({ where: { senderId } });
    return sqlEntities.map(entity => MessageMapper.toDomain(entity));
  }

  async findByReceiverId(receiverId: number): Promise<MessageEntity[]> {
    const sqlEntities = await this.repository.find({ where: { receiverId } });
    return sqlEntities.map(entity => MessageMapper.toDomain(entity));
  }

  async findUnassignedMessages(): Promise<MessageEntity[]> {
    const sqlEntities = await this.repository.find({ 
      where: { receiverId: null } 
    });
    return sqlEntities.map(entity => MessageMapper.toDomain(entity));
  }

  async findByAdvisorId(advisorId: number): Promise<MessageEntity[]> {
    // Récupérer les messages assignés à ce conseiller
    const sqlEntities = await this.repository.find({ 
      where: { assignedAdvisorId: advisorId } 
    });
    return sqlEntities.map(entity => MessageMapper.toDomain(entity));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<MessageEntity[]> {
    const sqlEntities = await this.repository
      .createQueryBuilder("message")
      .where("message.date >= :startDate", { startDate })
      .andWhere("message.date <= :endDate", { endDate })
      .getMany();
    return sqlEntities.map(entity => MessageMapper.toDomain(entity));
  }

  async findRecentMessages(limit: number): Promise<MessageEntity[]> {
    const sqlEntities = await this.repository
      .createQueryBuilder("message")
      .orderBy("message.date", "DESC")
      .limit(limit)
      .getMany();
    return sqlEntities.map(entity => MessageMapper.toDomain(entity));
  }

  async findAll(): Promise<MessageEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => MessageMapper.toDomain(entity));
  }

  async save(message: MessageEntity): Promise<void> {
    const sqlEntity = MessageMapper.toSQL(message);
    await this.repository.save(sqlEntity);
    
    // Sauvegarder l'assignation si elle existe
    if (this.advisorAssignments.has(message.id)) {
      sqlEntity.assignedAdvisorId = this.advisorAssignments.get(message.id);
      await this.repository.update({ id: message.id }, { assignedAdvisorId: sqlEntity.assignedAdvisorId });
    }
  }

  async update(message: MessageEntity): Promise<void> {
    const sqlEntity = MessageMapper.toSQL(message);
    await this.repository.update({ id: message.id }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
    this.advisorAssignments.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async countUnassignedMessages(): Promise<number> {
    return await this.repository.count({ where: { receiverId: null } });
  }

  async countBySenderId(senderId: number): Promise<number> {
    return await this.repository.count({ where: { senderId } });
  }

  // Méthodes supplémentaires pour l'assignation des conseillers
  async assignAdvisor(messageId: number, advisorId: number): Promise<void> {
    this.advisorAssignments.set(messageId, advisorId);
    await this.repository.update({ id: messageId }, { assignedAdvisorId: advisorId });
  }

  async transferToAdvisor(messageId: number, newAdvisorId: number): Promise<void> {
    this.advisorAssignments.set(messageId, newAdvisorId);
    await this.repository.update({ id: messageId }, { assignedAdvisorId: newAdvisorId });
  }
}

