import { apiClient } from './ApiClient';
import { NotificationServiceInterface } from '@/application/services/NotificationService';
import { NotificationDto } from '@/shared/dto';

export class NotificationApiAdapter implements NotificationServiceInterface {
  async getNotifications(userId: number): Promise<NotificationDto[] | Error> {
    try {
      return await apiClient.get<NotificationDto[]>('/api/notifications');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des notifications');
    }
  }

  async markAsRead(notificationId: number): Promise<void | Error> {
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`, {});
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la mise à jour de la notification');
    }
  }

  async getUnreadCount(userId: number): Promise<number | Error> {
    try {
      const notifications = await this.getNotifications(userId);
      if (notifications instanceof Error) return notifications;
      return notifications.filter(n => !n.read).length;
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du calcul des notifications non lues');
    }
  }
}

