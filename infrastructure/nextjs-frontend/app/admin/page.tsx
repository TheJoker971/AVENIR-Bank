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
    const rate = parseFloat(newRate); // Le taux est déjà en pourcentage (0-100)
    
    const success = await updateInterestRate(rate);
    if (success) {
      setSuccess(true);
      setNewRate('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'DIRECTOR') {
    return null;
  }

  return (
    <div className="p-8 text-pearl">
      <h1 className="font-display text-4xl font-bold text-gold mb-8">Administration de la Banque</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Link href="/admin/users" className="luxury-card rounded-xl p-8 hover:border-gold/40 transition-all group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</div>
          <h2 className="text-2xl font-semibold text-gold mb-3">Gestion des utilisateurs</h2>
          <p className="text-pearl/70">Gérer les comptes clients, conseillers et directeurs</p>
        </Link>

        <Link href="/admin/stocks" className="luxury-card rounded-xl p-8 hover:border-gold/40 transition-all group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📈</div>
          <h2 className="text-2xl font-semibold text-gold mb-3">Gestion des actions</h2>
          <p className="text-pearl/70">Créer, modifier et supprimer les actions disponibles</p>
        </Link>
      </div>

      <div className="luxury-card rounded-xl p-8">
        <h2 className="font-display text-3xl font-semibold text-gold mb-6">Taux d'épargne (Livret A)</h2>
        
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 text-red-400 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-600 text-green-400 px-6 py-4 rounded-xl">
            ✅ Taux mis à jour avec succès ! Les clients ont été notifiés.
          </div>
        )}

        {loading && !bankInfo ? (
          <div className="text-center py-6 text-pearl/60">Chargement...</div>
        ) : bankInfo && (
          <div className="mb-8 glass border border-gold/30 rounded-xl p-6">
            <p className="text-lg mb-3 text-pearl/70">
              Taux actuel d'intérêt du Livret A
            </p>
            <p className="font-display text-6xl font-bold text-gold">
              {bankInfo.interestRate.toFixed(2)}%
            </p>
          </div>
        )}

        <form onSubmit={handleUpdateRate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gold mb-3">
              Nouveau taux d'intérêt (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="input-premium w-full"
              placeholder="Ex: 2.5"
              required
            />
            <p className="mt-2 text-sm text-pearl/60">
              Les clients possédant un Livret A seront automatiquement notifiés
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-premium w-full py-3 text-lg disabled:opacity-50"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le taux'}
          </button>
        </form>
      </div>
    </div>
  );
}
