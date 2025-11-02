/**
 * Page Dashboard
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

  // Charger les valeurs totales des comptes d'épargne avec gains temps réel
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
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalSavingsBalance = savingsAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  
  // Calculer la valeur totale du portefeuille : comptes + livrets (avec gains) + actions
  const totalPortfolioValue = totalBalance + (totalSavingsValue || totalSavingsBalance) + (portfolioValue || 0);

  const getRoleName = (role: string) => {
    switch (role) {
      case 'CLIENT': return 'Client';
      case 'ADVISE': return 'Conseiller';
      case 'DIRECTOR': return 'Directeur';
      default: return role;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user.firstname} {user.lastname}
        </h1>
        <p className="text-gray-600 mt-2">Rôle: {getRoleName(user.role)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {user.role === 'CLIENT' && (
          <>
            <Link href="/accounts" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4">Comptes</h2>
              <p className="text-2xl font-bold text-blue-600">{accounts.length} compte(s)</p>
              <p className="text-gray-600 mt-2">Solde total: {totalBalance.toFixed(2)} €</p>
            </Link>
            <Link href="/savings" className="bg-green-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-green-200">
              <h2 className="text-xl font-semibold mb-4">Épargne</h2>
              <p className="text-2xl font-bold text-green-600">{savingsAccounts.length} livret(s)</p>
              <p className="text-gray-600 mt-2">Total épargné: {formatAmount(totalSavingsBalance)}</p>
              {totalSavingsValue > totalSavingsBalance && (
                <p className="text-xs text-green-600 mt-1">+ {formatAmount(totalSavingsValue - totalSavingsBalance)} de gains estimés</p>
              )}
            </Link>
            <Link href="/portfolio" className="bg-purple-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-purple-200">
              <h2 className="text-xl font-semibold mb-4">Portefeuille Actions</h2>
              <p className="text-2xl font-bold text-purple-600">{formatAmount(portfolioValue || 0)}</p>
              {totalGainLoss !== undefined && totalGainLoss !== 0 && (
                <p className={`text-sm mt-1 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{formatAmount(totalGainLoss)}
                </p>
              )}
            </Link>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Valeur Totale du Portefeuille</h2>
              <p className="text-3xl font-bold">{formatAmount(totalPortfolioValue)}</p>
              <p className="text-sm mt-2 opacity-90">Comptes + Épargne + Actions</p>
            </div>
            <Link href="/transfer" className="bg-blue-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-blue-200">
              <h2 className="text-xl font-semibold mb-4">Virements</h2>
              <p className="text-gray-600">Effectuer un virement</p>
            </Link>
            <Link href="/operations" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4">Opérations</h2>
              <p className="text-gray-600">Historique des opérations</p>
            </Link>
            <Link href="/stocks" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4">Investissements</h2>
              <p className="text-gray-600">Gérez vos actions</p>
            </Link>
            <Link href="/messages" className="bg-purple-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-purple-200">
              <h2 className="text-xl font-semibold mb-4">Messagerie</h2>
              <p className="text-gray-600">Contacter votre conseiller</p>
            </Link>
            <Link href="/beneficiaries" className="bg-orange-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-orange-200">
              <h2 className="text-xl font-semibold mb-4">Bénéficiaires</h2>
              <p className="text-gray-600">Gérer mes bénéficiaires</p>
            </Link>
          </>
        )}
        
        {user.role === 'ADVISE' && (
          <>
            <Link href="/credits" className="bg-yellow-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-yellow-200">
              <h2 className="text-xl font-semibold mb-4">Crédits</h2>
              <p className="text-gray-600">Gérer les crédits clients</p>
            </Link>
            <Link href="/messages" className="bg-purple-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-purple-200">
              <h2 className="text-xl font-semibold mb-4">Messagerie</h2>
              <p className="text-gray-600">Répondre aux clients</p>
            </Link>
          </>
        )}
        
        {user.role === 'DIRECTOR' && (
          <>
            <Link href="/admin" className="bg-purple-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-purple-200">
              <h2 className="text-xl font-semibold mb-4">Administration</h2>
              <p className="text-gray-600">Gestion de la banque</p>
            </Link>
            <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
              <p className="text-gray-600">Gérer les utilisateurs</p>
            </Link>
            <Link href="/admin/stocks" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <p className="text-gray-600">Gérer les actions</p>
            </Link>
          </>
        )}
      </div>

      {accounts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mes Comptes</h2>
          <div className="space-y-2">
            {accounts.slice(0, 3).map((account) => (
              <div key={account.id} className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">{account.accountNumber}</span>
                <span className="text-lg">{(account.balance || 0).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

