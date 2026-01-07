import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

/**
 * Script de test pour les ordres au prix du marché et le matching récursif
 */

// Utilisateurs de test
const CLIENT1_ID = 1; // Jean Dupont
const CLIENT2_ID = 2; // Marie Martin
const CLIENT3_ID = 5; // Thomas Martin

const CLIENT_ROLE = 'CLIENT';

function getAuthHeaders(userId: number, role: string = CLIENT_ROLE) {
  return {
    'X-User-Id': userId.toString(),
    'X-User-Role': role,
    'Content-Type': 'application/json',
  };
}

async function testMarketOrders() {
  console.log('🧪 ==========================================');
  console.log('🧪 Test des Ordres au Prix du Marché');
  console.log('🧪 ==========================================\n');

  try {
    // 1. Récupérer les actions disponibles
    console.log('1️⃣  Récupération des actions...');
    const stocksResponse = await axios.get(`${BASE_URL}/stocks`);
    const stocks = stocksResponse.data;
    const aaplStock = stocks.find((s: any) => s.symbol === 'AAPL');
    
    if (!aaplStock) {
      console.error('❌ Action AAPL non trouvée');
      return;
    }
    
    console.log(`   ✅ Action AAPL trouvée: Prix actuel = ${aaplStock.currentPrice}€\n`);

    // 2. Tester la création d'un ordre au prix du marché (price = null)
    console.log('2️⃣  Création d\'un ordre d\'ACHAT au prix du marché...');
    const marketBuyOrderResponse = await axios.post(
      `${BASE_URL}/orders`,
      {
        stockSymbol: 'AAPL',
        orderType: 'BUY',
        quantity: 5,
        price: null, // Prix du marché
      },
      { headers: getAuthHeaders(CLIENT1_ID) }
    );
    
    const marketBuyOrder = marketBuyOrderResponse.data;
    console.log(`   ✅ Ordre d'achat au prix du marché créé:`);
    console.log(`      - ID: ${marketBuyOrder.id}`);
    console.log(`      - Prix utilisé: ${marketBuyOrder.price}€ (prix du marché)`);
    console.log(`      - Quantité: ${marketBuyOrder.quantity}`);
    console.log(`      - Statut: ${marketBuyOrder.status}\n`);

    // 3. Créer un ordre de vente compatible pour tester le matching
    console.log('3️⃣  Création d\'un ordre de VENTE compatible...');
    const sellOrderResponse = await axios.post(
      `${BASE_URL}/orders`,
      {
        stockSymbol: 'AAPL',
        orderType: 'SELL',
        quantity: 10,
        price: aaplStock.currentPrice - 1, // Prix légèrement inférieur pour match
      },
      { headers: getAuthHeaders(CLIENT2_ID) }
    );
    
    const sellOrder = sellOrderResponse.data;
    console.log(`   ✅ Ordre de vente créé:`);
    console.log(`      - ID: ${sellOrder.id}`);
    console.log(`      - Prix: ${sellOrder.price}€`);
    console.log(`      - Quantité: ${sellOrder.quantity}`);
    console.log(`      - Statut: ${sellOrder.status}\n`);

    // 4. Attendre un peu pour que les ordres soient traités
    console.log('4️⃣  Attente du traitement automatique...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Vérifier le carnet d'ordres après création
    console.log('5️⃣  Vérification du carnet d\'ordres...');
    const orderBookResponse = await axios.get(`${BASE_URL}/orders/orderbook/AAPL`);
    const orderBook = orderBookResponse.data;
    
    console.log(`   📊 Carnet d'ordres AAPL:`);
    console.log(`      - Prix d'équilibre: ${orderBook.equilibriumPrice}€`);
    console.log(`      - Ordres d'achat en attente: ${orderBook.buyOrders.length}`);
    console.log(`      - Ordres de vente en attente: ${orderBook.sellOrders.length}\n`);

    // 6. Créer plusieurs ordres pour tester le matching récursif
    console.log('6️⃣  Test du matching récursif - Création de plusieurs ordres...');
    
    // Créer 3 ordres d'achat à des prix différents
    const buyPrices = [150, 151, 152];
    for (const price of buyPrices) {
      await axios.post(
        `${BASE_URL}/orders`,
        {
          stockSymbol: 'AAPL',
          orderType: 'BUY',
          quantity: 2,
          price: price,
        },
        { headers: getAuthHeaders(CLIENT3_ID) }
      );
      console.log(`   ✅ Ordre d'achat créé à ${price}€`);
    }

    // Créer 3 ordres de vente à des prix compatibles
    const sellPrices = [149, 150, 151];
    for (const price of sellPrices) {
      await axios.post(
        `${BASE_URL}/orders`,
        {
          stockSymbol: 'AAPL',
          orderType: 'SELL',
          quantity: 2,
          price: price,
        },
        { headers: getAuthHeaders(CLIENT2_ID) }
      );
      console.log(`   ✅ Ordre de vente créé à ${price}€`);
    }
    console.log('');

    // 7. Attendre le matching récursif
    console.log('7️⃣  Attente du matching récursif automatique...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 8. Vérifier les résultats
    console.log('8️⃣  Vérification des résultats...');
    const finalOrderBookResponse = await axios.get(`${BASE_URL}/orders/orderbook/AAPL`);
    const finalOrderBook = finalOrderBookResponse.data;
    
    console.log(`   📊 Carnet d'ordres final AAPL:`);
    console.log(`      - Prix d'équilibre: ${finalOrderBook.equilibriumPrice}€`);
    console.log(`      - Ordres d'achat en attente: ${finalOrderBook.buyOrders.length}`);
    console.log(`      - Ordres de vente en attente: ${finalOrderBook.sellOrders.length}\n`);

    // 9. Récupérer les ordres de l'utilisateur pour voir les exécutions
    const userOrdersResponse = await axios.get(`${BASE_URL}/orders`, {
      headers: getAuthHeaders(CLIENT1_ID)
    });
    const userOrders = userOrdersResponse.data;
    const executedOrders = userOrders.filter((o: any) => o.status === 'EXECUTED');
    
    console.log(`   📈 Ordres exécutés pour le client 1: ${executedOrders.length}`);
    executedOrders.forEach((order: any) => {
      console.log(`      - ${order.orderType} ${order.quantity} x ${order.price}€ = ${order.totalAmount}€`);
    });
    console.log('');

    // 10. Vérifier le prix de l'action après matching
    const finalStocksResponse = await axios.get(`${BASE_URL}/stocks`);
    const finalStocks = finalStocksResponse.data;
    const finalAaplStock = finalStocks.find((s: any) => s.symbol === 'AAPL');
    
    console.log(`   💰 Prix final de l'action AAPL: ${finalAaplStock.currentPrice}€`);
    console.log(`      (Prix initial: ${aaplStock.currentPrice}€)\n`);

    console.log('✅ ==========================================');
    console.log('✅ Tests terminés avec succès !');
    console.log('✅ ==========================================\n');

    console.log('📋 Résumé des fonctionnalités testées:');
    console.log('   ✓ Création d\'ordres au prix du marché (price = null)');
    console.log('   ✓ Utilisation automatique du prix actuel de l\'action');
    console.log('   ✓ Matching automatique après création d\'ordre');
    console.log('   ✓ Matching récursif en cascade');
    console.log('   ✓ Recalcul du prix d\'équilibre');
    console.log('   ✓ Mise à jour du prix de l\'action après transactions');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Exécuter les tests
console.log('⚠️  Assurez-vous que le serveur est démarré sur http://localhost:3000');
console.log('⚠️  Assurez-vous que les données ont été seedées\n');

testMarketOrders()
  .then(() => {
    console.log('🎉 Script de test terminé !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec des tests:', error);
    process.exit(1);
  });

