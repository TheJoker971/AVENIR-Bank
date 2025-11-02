/**
 * Page Dashboard
 */
'use client';

import { useAuth } from '@/presentation/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAccounts } from '@/presentation/hooks/useAccounts';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { accounts, savingsAccounts } = useAccounts(user?.id || null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

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

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);

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
        <Link href="/accounts" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Comptes</h2>
          <p className="text-2xl font-bold text-blue-600">{accounts.length} compte(s)</p>
          <p className="text-gray-600 mt-2">Solde total: {totalBalance.toFixed(2)} €</p>
        </Link>
        <Link href="/accounts" className="bg-green-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-green-200">
          <h2 className="text-xl font-semibold mb-4">Épargne</h2>
          <p className="text-2xl font-bold text-green-600">{savingsAccounts.length} livret(s)</p>
          <p className="text-gray-600 mt-2">Total épargné: {totalSavings.toFixed(2)} €</p>
        </Link>
        <Link href="/stocks" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Investissements</h2>
          <p className="text-gray-600">Gérez vos actions</p>
        </Link>
        {user.role === 'ADVISE' && (
          <Link href="/credits" className="bg-yellow-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-yellow-200">
            <h2 className="text-xl font-semibold mb-4">Crédits</h2>
            <p className="text-gray-600">Gérer les crédits clients</p>
          </Link>
        )}
        {user.role === 'DIRECTOR' && (
          <Link href="/admin" className="bg-purple-50 rounded-lg shadow p-6 hover:shadow-lg transition border border-purple-200">
            <h2 className="text-xl font-semibold mb-4">Administration</h2>
            <p className="text-gray-600">Gestion de la banque</p>
          </Link>
        )}
      </div>

      {accounts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mes Comptes</h2>
          <div className="space-y-2">
            {accounts.slice(0, 3).map((account) => (
              <div key={account.id} className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">{account.accountNumber}</span>
                <span className="text-lg">{account.balance.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

