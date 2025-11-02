/**
 * Layout racine Next.js App Router
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/presentation/components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AVENIR Bank - Gestion Bancaire Moderne',
  description: 'Application bancaire moderne avec Clean Architecture',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}

