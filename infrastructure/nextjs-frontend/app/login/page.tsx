/**
 * Page de connexion Premium
 */
'use client';

import { useState } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await login({ email, password });
    if (result) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gold/5 rounded-full blur-3xl -top-48 -left-48"></div>
        <div className="absolute w-96 h-96 bg-gold/5 rounded-full blur-3xl -bottom-48 -right-48"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold shadow-2xl shadow-gold/30 mb-6">
            <span className="text-5xl">👑</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-gold mb-2">
            Bienvenue
          </h2>
          <p className="text-pearl/60">Accédez à votre espace privé</p>
        </div>

        <div className="luxury-card p-8 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="text-sm text-red-400">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pearl/80 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-premium w-full"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pearl/80 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-premium w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-pearl/60">
                Nouveau client ?{' '}
                <Link href="/register" className="text-gold hover:text-yellow-400 font-medium transition-colors">
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-pearl/40 hover:text-gold transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
