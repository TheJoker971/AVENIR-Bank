/**
 * Composant Header Premium - Presentation Layer
 */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useNotifications } from '@/presentation/hooks/useNotifications';
import { useActiveAccount } from '@/presentation/hooks/useActiveAccount';
import { formatAmount } from '@/shared/utils';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { unreadCount } = useNotifications(user?.id || null);
  const { activeAccount, fetchActiveAccount } = useActiveAccount();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Charger le compte actif au montage si user connecté ET que c'est un client
  useEffect(() => {
    if (user && isAuthenticated && user.role === 'CLIENT') {
      fetchActiveAccount(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);

  return (
    <header className="glass border-b border-sky-200/40 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et Navigation */}
          <div className="flex items-center gap-8">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center group">
              <Image 
                src="/logo.png" 
                alt="AVENIR Bank" 
                width={120} 
                height={40}
                className="h-10 w-auto transition-opacity duration-200 group-hover:opacity-80"
                priority
              />
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center">
                <Link
                  href="/"
                  className={`inline-flex items-center h-16 px-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    pathname === '/'
                      ? 'text-sky-600 border-sky-500'
                      : 'text-slate-600 border-transparent hover:text-sky-600 hover:border-sky-400'
                  }`}
                >
                  Accueil
                </Link>
                
                {/* Tableau de Bord : visible pour tous si connectés */}
                {user && (user.role === 'ADVISE' || user.role === 'DIRECTOR' || user.role === 'CLIENT') && (
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center h-16 px-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                      pathname === '/dashboard'
                        ? 'text-sky-600 border-sky-500'
                        : 'text-slate-600 border-transparent hover:text-sky-600 hover:border-sky-400'
                    }`}
                  >
                    Tableau de Bord
                  </Link>
                )}

                {/* Liens spécifiques aux clients : uniquement si compte actif sélectionné */}
                {user && user.role === 'CLIENT' && activeAccount && (
                  <>
                    <Link
                      href="/transfer"
                      className={`inline-flex items-center h-16 px-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                        pathname === '/transfer'
                          ? 'text-sky-600 border-sky-500'
                          : 'text-slate-600 border-transparent hover:text-sky-600 hover:border-sky-400'
                      }`}
                    >
                      Virements
                    </Link>
                    <Link
                      href="/stocks"
                      className={`inline-flex items-center h-16 px-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                        pathname === '/stocks'
                          ? 'text-sky-600 border-sky-500'
                          : 'text-slate-600 border-transparent hover:text-sky-600 hover:border-sky-400'
                      }`}
                    >
                      Actions
                    </Link>
                    <Link
                      href="/my-orders"
                      className={`inline-flex items-center h-16 px-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                        pathname === '/my-orders'
                          ? 'text-sky-600 border-sky-500'
                          : 'text-slate-600 border-transparent hover:text-sky-600 hover:border-sky-400'
                      }`}
                    >
                      Mes Ordres
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>
          
          {/* Actions à droite */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Chargement...</span>
              </div>
            ) : isAuthenticated ? (
              <>
                {user && (
                  <>
                    {/* Profil utilisateur */}
                    <div className="hidden sm:flex items-center gap-4 pr-4 border-r border-sky-200/50">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">{user.firstname} {user.lastname}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'DIRECTOR' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          user.role === 'ADVISE' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}>
                          {user.role === 'DIRECTOR' ? 'Directeur' : user.role === 'ADVISE' ? 'Conseiller' : 'Client'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Indicateur de compte actif */}
                    {user.role === 'CLIENT' && activeAccount && (
                      <div className="relative hidden lg:block">
                        <button
                          onClick={() => setShowAccountMenu(!showAccountMenu)}
                          className="flex items-center gap-2 px-3 py-2 bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/60 rounded-lg transition-all duration-200 group"
                        >
                          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <div className="text-left">
                            <p className="text-xs text-slate-500 leading-none mb-0.5">Compte actif</p>
                            <p className="text-sm font-mono font-semibold text-slate-800 leading-none">
                              ****{activeAccount.iban.slice(-4)}
                            </p>
                          </div>
                          <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showAccountMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* Menu déroulant */}
                        {showAccountMenu && (
                          <div className="absolute right-0 mt-2 w-64 bg-white border border-sky-200/60 rounded-xl shadow-xl shadow-sky-200/30 py-2 z-50">
                            <div className="px-4 py-2 border-b border-sky-100">
                              <p className="text-xs font-medium text-slate-500">Compte sélectionné</p>
                            </div>
                            <div className="px-4 py-3">
                              <p className="text-xs text-slate-500 mb-1">Numéro de compte</p>
                              <p className="text-sm font-mono font-semibold text-slate-800 mb-2">{activeAccount.accountNumber}</p>
                              <p className="text-xs text-slate-500 mb-1">Solde disponible</p>
                              <p className="text-lg font-bold text-sky-600">{formatAmount(activeAccount.balance)}</p>
                            </div>
                            <div className="border-t border-sky-100 mt-2">
                              <button
                                onClick={() => {
                                  setShowAccountMenu(false);
                                  router.push('/select-account');
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-sky-600 hover:bg-sky-50 transition-colors duration-200 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Changer de compte
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Notifications */}
                    <Link href="/notifications" className="relative group">
                      <div className="p-2 rounded-lg hover:bg-sky-50 transition-colors duration-200">
                        <svg className="w-5 h-5 text-slate-600 group-hover:text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                
                {/* Bouton Déconnexion */}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white border border-sky-200/60 hover:border-sky-300 rounded-lg transition-all duration-200 hover:shadow-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white border border-sky-200/60 hover:border-sky-300 rounded-lg transition-all duration-200"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-sky-400/40"
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

