/**
 * Page de gestion des notifications (Client)
 */
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useNotifications } from '@/presentation/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/shared/utils/formatDate';

export default function NotificationsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { notifications, unreadNotifications, readNotifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(user?.id || null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non {unreadCount > 1 ? 'lues' : 'lue'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Vous n'avez aucune notification</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Notifications non lues */}
          {unreadNotifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Non lues</h2>
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                        <p className="text-gray-700">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Marquer comme lu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications lues */}
          {readNotifications.length > 0 && (
            <div className={unreadNotifications.length > 0 ? 'mt-8' : ''}>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Lues</h2>
              <div className="space-y-3">
                {readNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-gray-50 border-l-4 border-gray-300 rounded-lg shadow p-4 opacity-75"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">{notification.title}</h3>
                      <p className="text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(notification.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

