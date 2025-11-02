/**
 * Layout racine Next.js App Router - Premium Design
 */
import type { Metadata } from 'next';
import { Header } from '@/presentation/components/Header';
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
        <div className="relative min-h-screen">
          {/* Background gradient overlay */}
          <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95 z-0" />
          
          {/* Subtle pattern overlay */}
          <div 
            className="fixed inset-0 opacity-5 z-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.4) 1px, transparent 0)`,
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
      </body>
    </html>
  );
}

