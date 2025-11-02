import { NotificationDto } from '@/shared/dto';

export interface NotificationServiceInterface {
  getNotifications(userId: number): Promise<NotificationDto[] | Error>;
  markAsRead(notificationId: number): Promise<void | Error>;
  getUnreadCount(userId: number): Promise<number | Error>;
}

