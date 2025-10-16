#!/usr/bin/env node

import { ExpressServer } from './server/ExpressServer';

async function main() {
  console.log('🏦 Démarrage de AVENIR Bank API...');
  
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const server = new ExpressServer(port);
  
  try {
    await server.start();
    console.log('✅ Serveur démarré avec succès !');
    console.log('📚 Documentation API disponible sur /health');
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion des signaux pour un arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

// Démarrer le serveur
main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
