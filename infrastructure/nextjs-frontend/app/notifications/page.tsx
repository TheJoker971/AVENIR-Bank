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
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="p-8 text-pearl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl font-bold text-gold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-pearl/60 mt-2">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non {unreadCount > 1 ? 'lues' : 'lue'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-premium"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 glass rounded-lg border border-gold/20">
          <p className="text-pearl/60">Vous n'avez aucune notification</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Notifications non lues */}
          {unreadNotifications.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gold">Non lues</h2>
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="luxury-card border-l-4 border-gold rounded-xl p-5 hover:border-gold/60 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-pearl text-lg mb-2">{notification.title}</h3>
                        <p className="text-pearl/70">{notification.message}</p>
                        <p className="text-xs text-pearl/40 mt-3">{formatDate(notification.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4 text-gold hover:text-yellow-400 text-sm px-3 py-1 rounded-lg border border-gold/20 hover:border-gold/40 transition-all"
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
              <h2 className="text-2xl font-semibold mb-4 text-pearl/60">Lues</h2>
              <div className="space-y-3">
                {readNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="glass border-l-4 border-pearl/20 rounded-xl p-5 opacity-60"
                  >
                    <div>
                      <h3 className="font-semibold text-pearl/70 text-lg mb-2">{notification.title}</h3>
                      <p className="text-pearl/50">{notification.message}</p>
                      <p className="text-xs text-pearl/30 mt-3">{formatDate(notification.createdAt)}</p>
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

