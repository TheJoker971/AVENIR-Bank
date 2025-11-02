/**
 * Composant Header Premium - Presentation Layer
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

  // Ne pas afficher le header sur la page d'accueil non authentifiée
  if (pathname === '/' && !isAuthenticated) {
    return null;
  }

  // Ne pas afficher le header sur les pages d'authentification
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="glass border-b border-gold/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold flex items-center justify-center shadow-lg shadow-gold/50 group-hover:shadow-xl group-hover:shadow-gold/70 transition-all duration-300">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-gold tracking-wide">AVENIR</span>
                <p className="text-xs text-pearl/60 tracking-widest">BANQUE PRIVÉE</p>
              </div>
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden lg:flex lg:space-x-8">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium tracking-wide transition-all duration-300 ${
                    pathname === '/dashboard'
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-pearl/70 hover:text-gold hover:border-b-2 hover:border-gold/50'
                  }`}
                >
                  Tableau de Bord
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                <span className="text-sm text-pearl/60">Chargement...</span>
              </div>
            ) : isAuthenticated ? (
              <>
                {user && (
                  <>
                    <div className="hidden sm:flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-pearl">{user.firstname} {user.lastname}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                          {user.role === 'DIRECTOR' ? 'Directeur' : 
                           user.role === 'ADVISE' ? 'Conseiller Privé' : 'Client Prestige'}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      href="/notifications"
                      className="relative group"
                    >
                      <div className="p-2 rounded-lg glass border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/20">
                        <span className="text-xl">🔔</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black bg-gradient-to-br from-gold to-yellow-400 rounded-full shadow-lg shadow-gold/50 animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 text-sm text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-gold via-yellow-400 to-gold text-black rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/50 hover:scale-105"
                >
                  Devenir Membre
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

