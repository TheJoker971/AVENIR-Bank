/**
 * Page d'accueil
 */
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          🏦 AVENIR Bank
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Alliance de Valeurs Économiques et Nationales Investies Responsablement
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}

