import { NotificationEntity } from "domain/entities/NotificationEntity";

export interface NotificationRepositoryInterface {
  findById(id: number): Promise<NotificationEntity | null>;
  findByRecipientId(recipientId: number): Promise<NotificationEntity[]>;
  findUnreadByRecipientId(recipientId: number): Promise<NotificationEntity[]>;
  findByType(type: string): Promise<NotificationEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<NotificationEntity[]>;
  findAll(): Promise<NotificationEntity[]>;
  save(notification: NotificationEntity): Promise<void>;
  update(notification: NotificationEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  markAsRead(id: number): Promise<void>;
  markAllAsRead(recipientId: number): Promise<void>;
  countUnreadByRecipientId(recipientId: number): Promise<number>;
}
