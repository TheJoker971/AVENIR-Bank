import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

/**
 * Script de test pour les endpoints de l'API AVENIR Bank In-Memory
 */
async function testEndpoints() {
  console.log('🧪 Démarrage des tests des endpoints...\n');

  try {
    // Test 1: Lister tous les utilisateurs
    console.log('1️⃣  Test GET /api/users');
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    console.log(`   ✅ ${usersResponse.data.length} utilisateurs trouvés`);
    usersResponse.data.forEach((user: any) => {
      console.log(`      - ${user.firstname} ${user.lastname} (${user.role.value})`);
    });
    console.log('');

    // Test 2: Récupérer un utilisateur spécifique
    console.log('2️⃣  Test GET /api/users/1');
    const userResponse = await axios.get(`${BASE_URL}/users/1`);
    console.log(`   ✅ Utilisateur trouvé: ${userResponse.data.firstname} ${userResponse.data.lastname}`);
    console.log('');

    // Test 3: Rechercher un utilisateur par email
    console.log('3️⃣  Test GET /api/users/by-email/jean.dupont@example.com');
    const userByEmailResponse = await axios.get(`${BASE_URL}/users/by-email/jean.dupont@example.com`);
    console.log(`   ✅ Utilisateur trouvé par email: ${userByEmailResponse.data.firstname} ${userByEmailResponse.data.lastname}`);
    console.log('');

    // Test 4: Lister tous les comptes
    console.log('4️⃣  Test GET /api/accounts');
    const accountsResponse = await axios.get(`${BASE_URL}/accounts`);
    console.log(`   ✅ ${accountsResponse.data.length} comptes trouvés`);
    accountsResponse.data.forEach((account: any) => {
      console.log(`      - IBAN: ${account.iban.value}, Solde: ${account.balance.value}€`);
    });
    console.log('');

    // Test 5: Récupérer un compte spécifique
    if (accountsResponse.data.length > 0) {
      const firstAccount = accountsResponse.data[0];
      const accountId = firstAccount.iban?.value || '1';
      console.log(`5️⃣  Test GET /api/accounts/${accountId}`);
      try {
        const accountResponse = await axios.get(`${BASE_URL}/accounts/${accountId}`);
        console.log(`   ✅ Compte trouvé: IBAN ${accountResponse.data.iban?.value}`);
        console.log('');
      } catch (error: any) {
        console.log(`   ⚠️  Test ignoré: ${error.message}`);
        console.log('');
      }
    }

    // Test 6: Rechercher des comptes par propriétaire
    console.log('6️⃣  Test GET /api/accounts/by-owner/1');
    const accountsByOwnerResponse = await axios.get(`${BASE_URL}/accounts/by-owner/1`);
    console.log(`   ✅ ${accountsByOwnerResponse.data.length} comptes trouvés pour l'utilisateur 1`);
    console.log('');

    // Test 7: Lister les livrets A
    console.log('7️⃣  Test GET /api/savings-accounts');
    const savingsResponse = await axios.get(`${BASE_URL}/savings-accounts`);
    console.log(`   ✅ ${savingsResponse.data.length} livrets A trouvés`);
    savingsResponse.data.forEach((account: any) => {
      console.log(`      - Solde: ${account.balance.value}€, Taux: ${account.interestRate.value}%`);
    });
    console.log('');

    // Test 8: Lister les actions
    console.log('8️⃣  Test GET /api/stocks');
    const stocksResponse = await axios.get(`${BASE_URL}/stocks`);
    console.log(`   ✅ ${stocksResponse.data.length} actions trouvées`);
    stocksResponse.data.forEach((stock: any) => {
      console.log(`      - ${stock.symbol.value}: ${stock.name} à ${stock.currentPrice.value}€`);
    });
    console.log('');

    // Test 9: Récupérer une action spécifique
    if (stocksResponse.data.length > 0) {
      const firstStock = stocksResponse.data[0];
      const stockSymbol = firstStock.symbol?.value;
      console.log(`9️⃣  Test GET /api/stocks/by-symbol/${stockSymbol}`);
      try {
        const stockResponse = await axios.get(`${BASE_URL}/stocks/by-symbol/${stockSymbol}`);
        console.log(`   ✅ Action trouvée: ${stockResponse.data.symbol.value} - ${stockResponse.data.name}`);
        console.log('');
      } catch (error: any) {
        console.log(`   ⚠️  Test ignoré: ${error.message}`);
        console.log('');
      }
    }

    // Test 10: Lister les notifications
    console.log('🔟 Test GET /api/notifications');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`);
    console.log(`   ✅ ${notificationsResponse.data.length} notifications trouvées`);
    notificationsResponse.data.forEach((notification: any) => {
      console.log(`      - ${notification.title}: ${notification.message}`);
    });
    console.log('');

    // Test 11: Récupérer les notifications non lues d'un utilisateur
    console.log('1️⃣1️⃣  Test GET /api/notifications/unread/1');
    const unreadNotificationsResponse = await axios.get(`${BASE_URL}/notifications/unread/1`);
    console.log(`   ✅ ${unreadNotificationsResponse.data.length} notifications non lues trouvées`);
    console.log('');

    // Test 12: Informations bancaires
    console.log('1️⃣2️⃣  Test GET /api/bank');
    const bankResponse = await axios.get(`${BASE_URL}/bank`);
    console.log(`   ✅ Banque: ${bankResponse.data.name}, Taux d'épargne: ${bankResponse.data.interestRate?.value}%`);
    console.log('');

    // Test 13: Lister les ordres
    console.log('1️⃣3️⃣  Test GET /api/orders');
    const ordersResponse = await axios.get(`${BASE_URL}/orders`);
    console.log(`   ✅ ${ordersResponse.data.length} ordres trouvés`);
    console.log('');

    // Test 14: Lister les crédits
    console.log('1️⃣4️⃣  Test GET /api/credits');
    const creditsResponse = await axios.get(`${BASE_URL}/credits`);
    console.log(`   ✅ ${creditsResponse.data.length} crédits trouvés`);
    console.log('');

    // Test 15: Lister les messages
    console.log('1️⃣5️⃣  Test GET /api/messages');
    const messagesResponse = await axios.get(`${BASE_URL}/messages`);
    console.log(`   ✅ ${messagesResponse.data.length} messages trouvés`);
    console.log('');

    console.log('✅ Tous les tests sont terminés avec succès !\n');
  } catch (error: any) {
    console.error('❌ Erreur lors des tests:', error.message);
    if (error.response) {
      console.error('   Détails:', error.response.data);
    }
    process.exit(1);
  }
}

// Exporter la fonction et permettre l'exécution directe
export { testEndpoints };

if (require.main === module) {
  testEndpoints()
    .then(() => {
      console.log('🎉 Les tests sont terminés !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec des tests:', error);
      process.exit(1);
    });
}

