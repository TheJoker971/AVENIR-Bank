/**
 * Page Dashboard Premium
 */
'use client';

import { useAuth } from '@/presentation/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccounts } from '@/presentation/hooks/useAccounts';
import { usePortfolio } from '@/presentation/hooks/usePortfolio';
import { useSavingsTotalValue } from '@/presentation/hooks/useSavingsTotalValue';
import { formatAmount } from '@/shared/utils';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { accounts, savingsAccounts } = useAccounts(user?.id || null);
  const { portfolio, totalValue: portfolioValue, totalGainLoss } = usePortfolio(user?.id || null);
  const { getTotalValue } = useSavingsTotalValue();
  const [totalSavingsValue, setTotalSavingsValue] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const loadSavingsTotalValues = async () => {
      if (savingsAccounts.length === 0) return;
      
      let total = 0;
      for (const account of savingsAccounts) {
        const totalValue = await getTotalValue(account.id);
        if (totalValue) {
          total += totalValue.totalValue;
        }
      }
      setTotalSavingsValue(total);
    };

    if (savingsAccounts.length > 0) {
      loadSavingsTotalValues();
    }
  }, [savingsAccounts, getTotalValue]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-gold rounded-full animate-pulse delay-75"></div>
          <div className="w-3 h-3 bg-gold rounded-full animate-pulse delay-150"></div>
          <span className="text-pearl/60 ml-4">Chargement de votre espace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalSavingsBalance = savingsAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalPortfolioValue = totalBalance + (totalSavingsValue || totalSavingsBalance) + (portfolioValue || 0);

  const getRoleName = (role: string) => {
    switch (role) {
      case 'CLIENT': return 'Client Prestige';
      case 'ADVISE': return 'Conseiller Privé';
      case 'DIRECTOR': return 'Directeur';
      default: return role;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* En-tête */}
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold flex items-center justify-center shadow-xl shadow-gold/30">
            <span className="text-3xl">
              {user.role === 'DIRECTOR' ? '👑' : user.role === 'ADVISE' ? '💼' : '💎'}
            </span>
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold text-gold">
              Bienvenue, {user.firstname}
            </h1>
            <p className="text-pearl/60 text-sm mt-1">{getRoleName(user.role)}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Client */}
      {user.role === 'CLIENT' && (
        <>
          {/* Patrimoine Total */}
          <div className="luxury-card p-8 rounded-2xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <p className="text-pearl/60 text-sm mb-2">Patrimoine Total</p>
              <p className="font-display text-6xl font-bold text-gold mb-4">
                {formatAmount(totalPortfolioValue)}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div>
                  <span className="text-pearl/60">Comptes: </span>
                  <span className="text-pearl font-medium">{formatAmount(totalBalance)}</span>
                </div>
                <div>
                  <span className="text-pearl/60">Épargne: </span>
                  <span className="text-pearl font-medium">{formatAmount(totalSavingsValue || totalSavingsBalance)}</span>
                </div>
                <div>
                  <span className="text-pearl/60">Actions: </span>
                  <span className="text-pearl font-medium">{formatAmount(portfolioValue || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/accounts" className="luxury-card p-6 rounded-xl group">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gold mb-2 group-hover:text-yellow-400 transition-colors">
                Comptes
              </h3>
              <p className="text-2xl font-bold text-pearl mb-1">{accounts.length}</p>
              <p className="text-pearl/60 text-sm">{formatAmount(totalBalance)}</p>
            </Link>

            <Link href="/savings" className="luxury-card p-6 rounded-xl group">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gold mb-2 group-hover:text-yellow-400 transition-colors">
                Épargne
              </h3>
              <p className="text-2xl font-bold text-pearl mb-1">{savingsAccounts.length}</p>
              <p className="text-pearl/60 text-sm">{formatAmount(totalSavingsBalance)}</p>
            </Link>

            <Link href="/portfolio" className="luxury-card p-6 rounded-xl group">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gold mb-2 group-hover:text-yellow-400 transition-colors">
                Portefeuille
              </h3>
              <p className="text-2xl font-bold text-pearl mb-1">{formatAmount(portfolioValue || 0)}</p>
              {totalGainLoss !== undefined && (
                <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{formatAmount(totalGainLoss)}
                </p>
              )}
            </Link>

            <Link href="/transfer" className="luxury-card p-6 rounded-xl group">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-semibold text-gold mb-2 group-hover:text-yellow-400 transition-colors">
                Virements
              </h3>
              <p className="text-pearl/60 text-sm mt-8">Effectuer un virement</p>
            </Link>
          </div>

          {/* Services additionnels */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gold mb-6">Vos Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/stocks" className="glass p-6 rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">🏛️</div>
                  <div>
                    <h3 className="font-semibold text-pearl">Investissements</h3>
                    <p className="text-sm text-pearl/60">Actions & Marchés</p>
                  </div>
                </div>
              </Link>

              <Link href="/operations" className="glass p-6 rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">📋</div>
                  <div>
                    <h3 className="font-semibold text-pearl">Opérations</h3>
                    <p className="text-sm text-pearl/60">Historique & Suivi</p>
                  </div>
                </div>
              </Link>

              <Link href="/messages" className="glass p-6 rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">💬</div>
                  <div>
                    <h3 className="font-semibold text-pearl">Messagerie</h3>
                    <p className="text-sm text-pearl/60">Conseiller Privé</p>
                  </div>
                </div>
              </Link>

              <Link href="/beneficiaries" className="glass p-6 rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">👥</div>
                  <div>
                    <h3 className="font-semibold text-pearl">Bénéficiaires</h3>
                    <p className="text-sm text-pearl/60">Gestion des contacts</p>
                  </div>
                </div>
              </Link>

              <Link href="/notifications" className="glass p-6 rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">🔔</div>
                  <div>
                    <h3 className="font-semibold text-pearl">Notifications</h3>
                    <p className="text-sm text-pearl/60">Alertes & Actualités</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Derniers comptes */}
          {accounts.length > 0 && (
            <div className="luxury-card p-8 rounded-2xl">
              <h2 className="font-display text-2xl font-bold text-gold mb-6">Vos Comptes</h2>
              <div className="space-y-4">
                {accounts.slice(0, 3).map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-4 glass rounded-lg border border-gold/10">
                    <div>
                      <p className="text-pearl font-medium">{account.accountNumber}</p>
                      <p className="text-pearl/60 text-sm">{account.iban}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gold">{formatAmount(account.balance || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Dashboard Conseiller */}
      {user.role === 'ADVISE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/credits" className="luxury-card p-8 rounded-xl">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-2xl font-semibold text-gold mb-2">Crédits</h3>
            <p className="text-pearl/60">Gérer les demandes de crédit</p>
          </Link>

          <Link href="/messages" className="luxury-card p-8 rounded-xl">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold text-gold mb-2">Messagerie</h3>
            <p className="text-pearl/60">Communiquer avec vos clients</p>
          </Link>

          <Link href="/notifications" className="luxury-card p-8 rounded-xl">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-2xl font-semibold text-gold mb-2">Notifications</h3>
            <p className="text-pearl/60">Alertes importantes</p>
          </Link>
        </div>
      )}

      {/* Dashboard Directeur */}
      {user.role === 'DIRECTOR' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin" className="luxury-card p-8 rounded-xl">
            <div className="text-5xl mb-4">⚙️</div>
            <h3 className="text-2xl font-semibold text-gold mb-2">Administration</h3>
            <p className="text-pearl/60">Paramètres de la banque</p>
          </Link>

          <Link href="/admin/users" className="luxury-card p-8 rounded-xl">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-2xl font-semibold text-gold mb-2">Utilisateurs</h3>
            <p className="text-pearl/60">Gestion des comptes</p>
          </Link>

          <Link href="/admin/stocks" className="luxury-card p-8 rounded-xl">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold text-gold mb-2">Actions</h3>
            <p className="text-pearl/60">Gestion du marché</p>
          </Link>

          <Link href="/notifications" className="luxury-card p-8 rounded-xl">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-2xl font-semibold text-gold mb-2">Notifications</h3>
            <p className="text-pearl/60">Centre de notifications</p>
          </Link>
        </div>
      )}
    </div>
  );
}
