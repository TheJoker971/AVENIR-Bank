/**
 * Page de gestion des bénéficiaires (Client)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useBeneficiaries } from '@/presentation/hooks/useBeneficiaries';
import { useRouter } from 'next/navigation';
import { formatIban } from '@/shared/utils';
import { formatDateShort } from '@/shared/utils/formatDate';
import Link from 'next/link';

export default function BeneficiariesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { beneficiaries, loading, error, createBeneficiary, deleteBeneficiary } = useBeneficiaries(user?.id || null);
  const router = useRouter();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    iban: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleCreateBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createBeneficiary({
      name: formData.name,
      iban: formData.iban,
    });

    if (result) {
      setShowCreateModal(false);
      setFormData({
        name: '',
        iban: '',
      });
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  return (
    <div className="p-8 text-pearl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="font-display text-4xl font-bold text-gold">Mes bénéficiaires</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-premium"
        >
          + Ajouter un bénéficiaire
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700 text-red-400 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="mb-8 glass border border-gold/20 rounded-xl p-6">
        <p className="text-sm text-pearl/70">
          💡 Les bénéficiaires vous permettent d'effectuer des virements rapidement vers des comptes externes.
          Vous pouvez également effectuer des virements entre vos propres comptes sans les ajouter comme bénéficiaires.
        </p>
      </div>

      {loading && beneficiaries.length === 0 ? (
        <div className="text-center py-8 text-pearl/60">Chargement...</div>
      ) : beneficiaries.length === 0 ? (
        <div className="text-center py-12 glass rounded-lg border border-gold/20">
          <p className="text-pearl/60 mb-4">Vous n'avez pas encore de bénéficiaire</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-premium"
          >
            Ajouter mon premier bénéficiaire
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="luxury-card rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gold">{beneficiary.name}</h3>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?')) {
                      deleteBeneficiary(beneficiary.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all"
                >
                  Supprimer
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-pearl/70">IBAN: {formatIban(beneficiary.iban)}</p>
                <p className="text-xs text-pearl/40">Ajouté le {formatDateShort(beneficiary.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="font-display text-3xl font-bold mb-6 text-gold text-center">Ajouter un bénéficiaire</h2>
            <form onSubmit={handleCreateBeneficiary}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">
                    Nom du bénéficiaire
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-premium w-full"
                    placeholder="Nom complet"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({...formData, iban: e.target.value.toUpperCase().replace(/\s/g, '')})}
                    className="input-premium w-full font-mono"
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    maxLength={27}
                    required
                  />
                  <p className="mt-2 text-xs text-pearl/50">
                    Format: FR + 25 caractères (lettres majuscules et chiffres)
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-premium disabled:opacity-50"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
