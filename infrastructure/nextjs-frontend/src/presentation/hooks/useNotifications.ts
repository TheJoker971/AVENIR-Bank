/**
 * Hook pour la gestion des notifications
 */
'use client';

import { useState, useEffect } from 'react';
import { NotificationApiAdapter } from '@/infrastructure/api/NotificationApiAdapter';
import { NotificationDto } from '@/shared/dto';
import { NotificationServiceInterface } from '@/application/services/NotificationService';

const notificationService: NotificationServiceInterface = new NotificationApiAdapter();

export const useNotifications = (userId: number | null) => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const result = await notificationService.getNotifications(userId);
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return;
    }

    setNotifications(result);
    setUnreadCount(result.filter(n => !n.read).length);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const markAsRead = async (notificationId: number) => {
    const result = await notificationService.markAsRead(notificationId);
    if (result instanceof Error) {
      setError(result.message);
      return false;
    }
    // Mettre à jour localement
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    return true;
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  return {
    notifications,
    unreadNotifications: notifications.filter(n => !n.read),
    readNotifications: notifications.filter(n => n.read),
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
};

