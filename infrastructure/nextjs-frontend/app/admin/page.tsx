/**
 * Page d'administration (Directeur)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useBank } from '@/presentation/hooks/useBank';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { bankInfo, loading, error, updateInterestRate } = useBank();
  const router = useRouter();
  
  const [newRate, setNewRate] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'DIRECTOR')) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(newRate) / 100; // Convertir en décimal
    
    const success = await updateInterestRate(rate);
    if (success) {
      setSuccess(true);
      setNewRate('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'DIRECTOR') {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Gestion des utilisateurs</h2>
          <p className="text-gray-600">Gérer les comptes clients, conseillers et directeurs</p>
        </Link>

        <Link href="/admin/stocks" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Gestion des actions</h2>
          <p className="text-gray-600">Créer, modifier et supprimer les actions disponibles</p>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Taux d'épargne (Livret A)</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            ✅ Taux mis à jour avec succès ! Les clients ont été notifiés.
          </div>
        )}

        {loading && !bankInfo ? (
          <div className="text-center py-4">Chargement...</div>
        ) : bankInfo && (
          <div className="mb-4">
            <p className="text-lg mb-2">
              <span className="font-medium">Taux actuel:</span>{' '}
              <span className="text-2xl font-bold text-blue-600">
                {(bankInfo.interestRate * 100).toFixed(2)}%
              </span>
            </p>
          </div>
        )}

        <form onSubmit={handleUpdateRate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau taux d'intérêt (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              placeholder="Ex: 2.5"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Les clients possédant un Livret A seront automatiquement notifiés
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le taux'}
          </button>
        </form>
      </div>
    </div>
  );
}

