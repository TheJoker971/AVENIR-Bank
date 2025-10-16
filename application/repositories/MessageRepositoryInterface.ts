import { MessageEntity } from "domain/entities/MessageEntity";

export interface MessageRepositoryInterface {
  findById(id: number): Promise<MessageEntity | null>;
  findBySenderId(senderId: number): Promise<MessageEntity[]>;
  findByReceiverId(receiverId: number): Promise<MessageEntity[]>;
  findUnassignedMessages(): Promise<MessageEntity[]>;
  findByAdvisorId(advisorId: number): Promise<MessageEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<MessageEntity[]>;
  findRecentMessages(limit: number): Promise<MessageEntity[]>;
  findAll(): Promise<MessageEntity[]>;
  save(message: MessageEntity): Promise<void>;
  update(message: MessageEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  countUnassignedMessages(): Promise<number>;
  countBySenderId(senderId: number): Promise<number>;
}
