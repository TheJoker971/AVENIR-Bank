/**
 * Page d'accueil Premium - AVENIR Bank
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated gold particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {mounted && [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Logo principal */}
          <div className="mb-12 inline-block">
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold flex items-center justify-center shadow-2xl shadow-gold/50 mb-6 animate-pulse">
                <span className="text-7xl">👑</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold to-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
            </div>
          </div>

          {/* Titre */}
          <h1 className="font-display text-7xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gold via-yellow-200 to-gold bg-clip-text text-transparent animate-shimmer">
              AVENIR
            </span>
          </h1>
          
          <div className="mb-8">
            <p className="text-xl md:text-2xl text-pearl/80 font-light tracking-widest uppercase mb-2">
              Banque Privée d'Excellence
            </p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
          </div>

          <p className="text-lg md:text-xl text-pearl/60 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Alliance de Valeurs Économiques et Nationales Investies Responsablement
          </p>

          {/* Caractéristiques premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
            <div className="glass p-6 rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-gold font-semibold mb-2">Service d'Excellence</h3>
              <p className="text-pearl/60 text-sm">Accompagnement personnalisé par des conseillers dédiés</p>
            </div>
            
            <div className="glass p-6 rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-gold font-semibold mb-2">Gestion Patrimoniale</h3>
              <p className="text-pearl/60 text-sm">Solutions d'investissement sur mesure</p>
            </div>
            
            <div className="glass p-6 rounded-xl border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-gold font-semibold mb-2">Sécurité Maximale</h3>
              <p className="text-pearl/60 text-sm">Protection optimale de vos actifs</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {!loading && (
              <>
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/register"
                      className="btn-premium text-lg px-10 py-4 group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Devenir Client Prestige
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </Link>
                    
                    <Link
                      href="/login"
                      className="px-10 py-4 text-lg text-pearl border-2 border-gold/30 hover:border-gold rounded-lg transition-all duration-300 hover:bg-gold/5 backdrop-blur-sm"
                    >
                      Espace Client
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="btn-premium text-lg px-10 py-4 group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Accéder au Tableau de Bord
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </Link>
                    
                    <Link
                      href="/stocks"
                      className="px-10 py-4 text-lg text-pearl border-2 border-gold/30 hover:border-gold rounded-lg transition-all duration-300 hover:bg-gold/5 backdrop-blur-sm"
                    >
                      Investir en Bourse
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Divider */}
          <div className="mt-20 mb-12">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <p className="text-4xl font-bold text-gold mb-2">15+</p>
              <p className="text-pearl/60 text-sm">Années d'Excellence</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gold mb-2">5000+</p>
              <p className="text-pearl/60 text-sm">Clients Privilégiés</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gold mb-2">€2.5B</p>
              <p className="text-pearl/60 text-sm">Actifs Sous Gestion</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gold mb-2">98%</p>
              <p className="text-pearl/60 text-sm">Satisfaction Client</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-5xl font-bold text-center mb-4">
            <span className="text-gold">Nos Services</span> <span className="text-pearl">Exclusifs</span>
          </h2>
          <p className="text-center text-pearl/60 mb-16 max-w-2xl mx-auto">
            Une gamme complète de services financiers conçus pour répondre aux besoins des patrimoines les plus exigeants
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '💰', title: 'Comptes Prestige', desc: 'Comptes courants et d\'épargne avec avantages exclusifs' },
              { icon: '📈', title: 'Investissements', desc: 'Accès aux marchés financiers et produits structurés' },
              { icon: '🏠', title: 'Crédits Patrimoniaux', desc: 'Financement sur mesure pour vos projets d\'exception' },
              { icon: '💬', title: 'Conseil Privé', desc: 'Conseillers dédiés disponibles 24/7' },
              { icon: '🌍', title: 'Banking International', desc: 'Services bancaires dans le monde entier' },
              { icon: '🎯', title: 'Gestion Pilotée', desc: 'Délégation de gestion par des experts' },
            ].map((service, index) => (
              <div
                key={index}
                className="luxury-card p-8 rounded-xl"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gold mb-3">{service.title}</h3>
                <p className="text-pearl/60">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/20 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-pearl/40 text-sm">
            © 2025 AVENIR Bank. Tous droits réservés. Banque soumise au contrôle de l'ACPR.
          </p>
        </div>
      </footer>
    </div>
  );
}

