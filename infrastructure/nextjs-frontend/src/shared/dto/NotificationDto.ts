/**
 * DTO Notification pour l'affichage
 */
export interface NotificationDto {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

