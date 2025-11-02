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
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || !user || user.role !== 'CLIENT') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mes bénéficiaires</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Ajouter un bénéficiaire
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 Les bénéficiaires vous permettent d'effectuer des virements rapidement vers des comptes externes.
          Vous pouvez également effectuer des virements entre vos propres comptes sans les ajouter comme bénéficiaires.
        </p>
      </div>

      {loading && beneficiaries.length === 0 ? (
        <div className="text-center py-8">Chargement...</div>
      ) : beneficiaries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de bénéficiaire</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Ajouter mon premier bénéficiaire
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{beneficiary.name}</h3>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?')) {
                      deleteBeneficiary(beneficiary.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Supprimer
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">IBAN: {formatIban(beneficiary.iban)}</p>
                <p className="text-xs text-gray-500">Ajouté le {formatDateShort(beneficiary.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Ajouter un bénéficiaire</h2>
            <form onSubmit={handleCreateBeneficiary}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du bénéficiaire
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Nom complet"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({...formData, iban: e.target.value.toUpperCase().replace(/\s/g, '')})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    maxLength={27}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: FR + 25 caractères (lettres majuscules et chiffres)
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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

