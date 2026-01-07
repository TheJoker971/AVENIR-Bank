/**
 * Page de test simplifiée pour sélection de compte
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectAccountTestPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  const testAccounts = [
    { id: 1, name: 'Compte 1', balance: 2500 },
    { id: 2, name: 'Compte 2', balance: 1200 },
  ];

  const handleConfirm = () => {
    console.log('✅ Compte confirmé:', selected);
    alert(`Compte ${selected} sélectionné !`);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">TEST - Sélection de Compte</h1>
        
        <div className="bg-yellow-100 border-2 border-yellow-500 p-4 rounded mb-6">
          <p className="font-bold">DEBUG INFO:</p>
          <p>Compte sélectionné: {selected || 'Aucun'}</p>
          <p>Nombre de comptes: {testAccounts.length}</p>
        </div>

        <div className="space-y-4 mb-6">
          {testAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => {
                console.log('Clic sur compte:', account.id);
                setSelected(account.id);
              }}
              className={`w-full p-6 border-2 rounded-lg text-left ${
                selected === account.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{account.name}</p>
                  <p className="text-gray-600">{account.balance} €</p>
                </div>
                {selected === account.id && (
                  <div className="text-2xl">✅</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* BOUTON TOUJOURS VISIBLE */}
        <div className="sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300">
          {selected ? (
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
            >
              CONFIRMER LE COMPTE {selected}
            </button>
          ) : (
            <div className="w-full py-4 bg-gray-200 text-gray-500 text-center font-bold rounded-lg">
              Sélectionnez un compte ci-dessus
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-500 underline"
          >
            Ignorer et aller au dashboard (pour test)
          </button>
        </div>
      </div>
    </div>
  );
}

