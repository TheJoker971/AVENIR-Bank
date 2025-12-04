/**
 * Layout racine Next.js App Router - Premium Design
 */
import type { Metadata } from 'next';
import { Header } from '@/presentation/components/Header';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'AVENIR Bank - Banque Privée d\'Excellence',
  description: 'Services bancaires de prestige pour une clientèle exclusive',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <Providers>
          <div className="relative min-h-screen">
            {/* Modern gradient background */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 z-0" />
            
            {/* Animated blue circles */}
            <div className="fixed inset-0 overflow-hidden z-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
            </div>
            
            {/* Subtle pattern overlay */}
            <div 
              className="fixed inset-0 opacity-[0.015] z-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(14, 165, 233, 0.6) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}
            />
            
            <div className="relative z-10">
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

