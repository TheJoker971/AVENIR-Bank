import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";
import { NotificationEntity } from "domain/entities/NotificationEntity";

export class NotificationRepositoryInMemory implements NotificationRepositoryInterface {
  private notifications: Map<number, NotificationEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<NotificationEntity | null> {
    const notification = this.notifications.get(id);
    return notification || null;
  }

  async findByRecipientId(recipientId: number): Promise<NotificationEntity[]> {
    const notifications: NotificationEntity[] = [];
    for (const notification of this.notifications.values()) {
      if (notification.getRecipientId() === recipientId) {
        notifications.push(notification);
      }
    }
    return notifications;
  }

  async findUnreadByRecipientId(recipientId: number): Promise<NotificationEntity[]> {
    const notifications: NotificationEntity[] = [];
    for (const notification of this.notifications.values()) {
      if (notification.getRecipientId() === recipientId && !notification.isRead) {
        notifications.push(notification);
      }
    }
    return notifications;
  }

  async findByType(type: string): Promise<NotificationEntity[]> {
    const notifications: NotificationEntity[] = [];
    for (const notification of this.notifications.values()) {
      if (notification.getType() === type) {
        notifications.push(notification);
      }
    }
    return notifications;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<NotificationEntity[]> {
    const notifications: NotificationEntity[] = [];
    for (const notification of this.notifications.values()) {
      const notificationDate = notification.getCreatedAt();
      if (notificationDate >= startDate && notificationDate <= endDate) {
        notifications.push(notification);
      }
    }
    return notifications;
  }

  async findAll(): Promise<NotificationEntity[]> {
    return Array.from(this.notifications.values());
  }

  async save(notification: NotificationEntity): Promise<void> {
    // L'entité doit déjà avoir un ID valide
    this.notifications.set(notification.id, notification);
  }

  async update(notification: NotificationEntity): Promise<void> {
    if (!this.notifications.has(notification.id)) {
      throw new Error(`Notification avec l'ID ${notification.id} introuvable`);
    }
    this.notifications.set(notification.id, notification);
  }

  async delete(id: number): Promise<void> {
    if (!this.notifications.has(id)) {
      throw new Error(`Notification avec l'ID ${id} introuvable`);
    }
    this.notifications.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.notifications.has(id);
  }

  async markAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification avec l'ID ${id} introuvable`);
    }
    const readNotification = notification.markAsRead();
    this.notifications.set(id, readNotification);
  }

  async markAllAsRead(recipientId: number): Promise<void> {
    const notifications = await this.findByRecipientId(recipientId);
    for (const notification of notifications) {
      if (!notification.isRead) {
        const readNotification = notification.markAsRead();
        this.notifications.set(notification.id, readNotification);
      }
    }
  }

  async countUnreadByRecipientId(recipientId: number): Promise<number> {
    const unread = await this.findUnreadByRecipientId(recipientId);
    return unread.length;
  }
}

