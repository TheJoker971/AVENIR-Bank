/**
 * Composant Header avec authentification - Presentation Layer
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useNotifications } from '@/presentation/hooks/useNotifications';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { unreadCount } = useNotifications(user?.id || null);

  // Ne pas afficher le header sur les pages d'authentification
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">🏦 AVENIR Bank</span>
            </Link>
            {isAuthenticated && (
              <nav className="hidden md:flex md:space-x-8 md:ml-10">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    pathname === '/dashboard'
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-sm text-gray-500">Chargement...</span>
            ) : isAuthenticated ? (
              <>
                {user && (
                  <>
                    <span className="hidden sm:block text-sm text-gray-700">
                      {user.firstname} {user.lastname}
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {user.role === 'DIRECTOR' ? 'Directeur' : 
                         user.role === 'ADVISE' ? 'Conseiller' : 'Client'}
                      </span>
                    </span>
                    <Link
                      href="/notifications"
                      className="relative text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                    >
                      🔔
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

