import { UserRepositoryInMemory } from '../repositories/in-memory/UserRepositoryInMemory';
import { AccountRepositoryInMemory, SavingsAccountRepositoryInMemory } from '../repositories/in-memory/AccountRepositoryInMemory';
import { BankRepositoryInMemory } from '../repositories/in-memory/BankRepositoryInMemory';
import { StockRepositoryInMemory } from '../repositories/in-memory/StockRepositoryInMemory';
import { NotificationRepositoryInMemory } from '../repositories/in-memory/NotificationRepositoryInMemory';
import { BeneficiaryRepositoryInMemory } from '../repositories/in-memory/BeneficiaryRepositoryInMemory';
import { OperationRepositoryInMemory } from '../repositories/in-memory/OperationRepositoryInMemory';
import { OrderRepositoryInMemory } from '../repositories/in-memory/OrderRepositoryInMemory';

// Import des entités
import { UserEntity } from 'domain/entities/UserEntity';
import { AccountEntity } from 'domain/entities/AccountEntity';
import { SavingsAccountEntity } from 'domain/entities/SavingsAccountEntity';
import { BankEntity } from 'domain/entities/BankEntity';
import { StockEntity } from 'domain/entities/StockEntity';
import { NotificationEntity } from 'domain/entities/NotificationEntity';
import { OperationEntity } from 'domain/entities/OperationEntity';
import { OrderEntity } from 'domain/entities/OrderEntity';
import { BeneficiaryEntity } from 'domain/entities/BeneficiaryEntity';

// Import des value objects
import { CountryCode } from 'domain/values/CountryCode';
import { BankCode } from 'domain/values/BankCode';
import { BranchCode } from 'domain/values/BranchCode';
import { Amount } from 'domain/values/Amount';
import { StockSymbol } from 'domain/values/StockSymbol';
import { InterestRate } from 'domain/values/InterestRate';
import { Iban } from 'domain/values/Iban';
import { Email } from 'domain/values/Email';
import { TransferData } from 'domain/values/TransferData';

/**
 * Script de seeding pour peupler les données in-memory de l'API AVENIR Bank
 */
async function seed(
  userRepository: UserRepositoryInMemory,
  accountRepository: AccountRepositoryInMemory,
  savingsAccountRepository: SavingsAccountRepositoryInMemory,
  bankRepository: BankRepositoryInMemory,
  stockRepository: StockRepositoryInMemory,
  notificationRepository: NotificationRepositoryInMemory,
  beneficiaryRepository?: BeneficiaryRepositoryInMemory,
  operationRepository?: OperationRepositoryInMemory,
  orderRepository?: OrderRepositoryInMemory
) {

  try {
    // 1. Créer la banque
    console.log('1️⃣  Création de la banque AVENIR...');
    const bankCodeOrError = BankCode.create('12345');
    if (bankCodeOrError instanceof Error) throw bankCodeOrError;
    
    const branchCodeOrError = BranchCode.create('67890');
    if (branchCodeOrError instanceof Error) throw branchCodeOrError;
    
    const bankResult = BankEntity.create('AVENIR Bank', '12345', '67890');
    if (bankResult instanceof Error) throw bankResult;
    
    // Utiliser le taux d'intérêt par défaut (2.5%)
    const defaultInterestRate = InterestRate.createDefault();
    
    const bank = bankResult.updateInterestRate(defaultInterestRate);
    await bankRepository.save(bank);
    console.log('   ✅ Banque créée avec succès\n');

    // 2. Créer des utilisateurs
    console.log('2️⃣  Création des utilisateurs...');
    
    // Client 1
    const client1 = UserEntity.createClient(
      1,
      'Jean',
      'Dupont',
      'jean.dupont@example.com',
      'MotDePasse123!',
      '123 Rue de la République, Paris'
    );
    if (client1 instanceof Error) throw client1;
    await userRepository.save(client1);
    console.log('   ✅ Client 1 créé: Jean Dupont');

    // Client 2
    const client2 = UserEntity.createClient(
      2,
      'Marie',
      'Martin',
      'marie.martin@example.com',
      'MotDePasse456!',
      '456 Avenue des Champs, Lyon'
    );
    if (client2 instanceof Error) throw client2;
    await userRepository.save(client2);
    console.log('   ✅ Client 2 créé: Marie Martin');

    // Client 3 - Thomas Martin
    const client3 = UserEntity.createClient(
      5,
      'Thomas',
      'Martin',
      'thomas.martin@example.com',
      'MotDePasse789!',
      '45 Avenue Victor Hugo, Nice'
    );
    if (client3 instanceof Error) throw client3;
    await userRepository.save(client3);
    console.log('   ✅ Client 3 créé: Thomas Martin');

    // Conseiller
    const advisor = UserEntity.createAdvise(
      3,
      'Pierre',
      'Dubois',
      'pierre.dubois@avenir.fr',
      'MotDePasse789!',
      '789 Boulevard de la Finance, Paris'
    );
    if (advisor instanceof Error) throw advisor;
    await userRepository.save(advisor);
    console.log('   ✅ Conseiller créé: Pierre Dubois');

    // Directeur
    const director = UserEntity.createDirector(
      4,
      'Sophie',
      'Bernard',
      'sophie.bernard@avenir.fr',
      'MotDePasseAdmin123!',
      '789 Boulevard de la Finance, Paris'
    );
    if (director instanceof Error) throw director;
    await userRepository.save(director);
    console.log('   ✅ Directeur créé: Sophie Bernard\n');

    // 3. Créer des comptes bancaires
    console.log('3️⃣  Création des comptes bancaires...');
    
    // Compte pour Jean Dupont
    const account1Result = AccountEntity.create(
      'FR' as CountryCode,
      bankCodeOrError,
      branchCodeOrError,
      '12',
      1500.50,
      1
    );
    if (account1Result instanceof Error) throw account1Result;
    await accountRepository.save(account1Result);
    console.log(`   ✅ Compte 1 créé: IBAN ${account1Result.iban.value}, Solde: ${account1Result.balance.value}€`);

    // Compte pour Marie Martin
    const account2Result = AccountEntity.create(
      'FR' as CountryCode,
      bankCodeOrError,
      branchCodeOrError,
      '34',
      2500.75,
      2
    );
    if (account2Result instanceof Error) throw account2Result;
    await accountRepository.save(account2Result);
    console.log(`   ✅ Compte 2 créé: IBAN ${account2Result.iban.value}, Solde: ${account2Result.balance.value}€`);

    // Compte supplémentaire pour Jean Dupont
    const account3Result = AccountEntity.create(
      'FR' as CountryCode,
      bankCodeOrError,
      branchCodeOrError,
      '56',
      500.00,
      1
    );
    if (account3Result instanceof Error) throw account3Result;
    await accountRepository.save(account3Result);
    console.log(`   ✅ Compte 3 créé: IBAN ${account3Result.iban.value}, Solde: ${account3Result.balance.value}€ (Jean Dupont)`);

    // Compte supplémentaire pour Marie Martin
    const account4Result = AccountEntity.create(
      'FR' as CountryCode,
      bankCodeOrError,
      branchCodeOrError,
      '78',
      1200.00,
      2
    );
    if (account4Result instanceof Error) throw account4Result;
    await accountRepository.save(account4Result);
    console.log(`   ✅ Compte 4 créé: IBAN ${account4Result.iban.value}, Solde: ${account4Result.balance.value}€ (Marie Martin)`);

    // Compte pour Thomas Martin
    const account5Result = AccountEntity.create(
      'FR' as CountryCode,
      bankCodeOrError,
      branchCodeOrError,
      '90',
      3500.00,
      5
    );
    if (account5Result instanceof Error) throw account5Result;
    await accountRepository.save(account5Result);
    console.log(`   ✅ Compte 5 créé: IBAN ${account5Result.iban.value}, Solde: ${account5Result.balance.value}€ (Thomas Martin)\n`);

    // 4. Créer des livrets A
    console.log('4️⃣  Création des livrets A...');
    
    // Livret A pour Jean Dupont
    const amount1 = Amount.create(1000);
    if (amount1 instanceof Error) throw amount1;
    const iban1 = account1Result.iban;
    
    const savingsAccount1 = SavingsAccountEntity.create(
      1,
      iban1,
      amount1,
      1,
      defaultInterestRate
    );
    await savingsAccountRepository.save(savingsAccount1);
    console.log(`   ✅ Livret A 1 créé: Solde: ${savingsAccount1.balance.value}€, Taux: ${savingsAccount1.interestRate.value}%`);

    // Livret A pour Marie Martin
    const amount2 = Amount.create(500);
    if (amount2 instanceof Error) throw amount2;
    const iban2 = account2Result.iban;
    
    const savingsAccount2 = SavingsAccountEntity.create(
      2,
      iban2,
      amount2,
      2,
      defaultInterestRate
    );
    await savingsAccountRepository.save(savingsAccount2);
    console.log(`   ✅ Livret A 2 créé: Solde: ${savingsAccount2.balance.value}€, Taux: ${savingsAccount2.interestRate.value}%\n`);

    // 5. Créer des actions
    console.log('5️⃣  Création des actions...');
    
    const stockPrice1 = Amount.create(150.50);
    if (stockPrice1 instanceof Error) throw stockPrice1;
    const symbol1 = StockSymbol.create('AAPL');
    if (symbol1 instanceof Error) throw symbol1;
    const stock1 = StockEntity.create(1, symbol1, 'Apple Inc.', stockPrice1, 1000000);
    await stockRepository.save(stock1);
    console.log(`   ✅ Action 1 créée: ${stock1.symbol.value} - ${stock1.name} à ${stock1.currentPrice.value}€`);

    const stockPrice2 = Amount.create(2800.00);
    if (stockPrice2 instanceof Error) throw stockPrice2;
    const symbol2 = StockSymbol.create('GOOGL');
    if (symbol2 instanceof Error) throw symbol2;
    const stock2 = StockEntity.create(2, symbol2, 'Alphabet Inc.', stockPrice2, 500000);
    await stockRepository.save(stock2);
    console.log(`   ✅ Action 2 créée: ${stock2.symbol.value} - ${stock2.name} à ${stock2.currentPrice.value}€`);

    const stockPrice3 = Amount.create(3300.00);
    if (stockPrice3 instanceof Error) throw stockPrice3;
    const symbol3 = StockSymbol.create('MSFT');
    if (symbol3 instanceof Error) throw symbol3;
    const stock3 = StockEntity.create(3, symbol3, 'Microsoft Corporation', stockPrice3, 750000);
    await stockRepository.save(stock3);
    console.log(`   ✅ Action 3 créée: ${stock3.symbol.value} - ${stock3.name} à ${stock3.currentPrice.value}€\n`);

    // 6. Créer des notifications
    console.log('6️⃣  Création des notifications...');
    
    const notification1 = NotificationEntity.createAccountCreatedNotification(
      1,
      1,
      client1.email,
      'Compte courant',
      account1Result.iban.value
    );
    await notificationRepository.save(notification1);
    console.log('   ✅ Notification 1 créée: Compte créé pour Jean Dupont');

    const notification2 = NotificationEntity.createAccountCreatedNotification(
      2,
      2,
      client2.email,
      'Compte courant',
      account2Result.iban.value
    );
    await notificationRepository.save(notification2);
    console.log('   ✅ Notification 2 créée: Compte créé pour Marie Martin\n');

    // 7. Créer des opérations (transfers)
    if (operationRepository) {
      console.log('7️⃣  Création des opérations...');
      
      // Opération 1: Transfert de Jean Dupont (compte 1) vers Marie Martin (compte 2)
      const transferAmount1 = Amount.create(150.00);
      if (transferAmount1 instanceof Error) throw transferAmount1;
      
      const transferData1 = TransferData.create(
        'Dupont',
        'Jean',
        account1Result.iban,
        'Martin',
        'Marie',
        account2Result.iban,
        false,
        'Remboursement de prêt'
      );
      if (transferData1 instanceof Error) throw transferData1;
      
      const operation1 = OperationEntity.create(1, transferData1, transferAmount1, 'COMPLETED');
      if (operation1 instanceof Error) throw operation1;
      await operationRepository.save(operation1);
      console.log(`   ✅ Opération 1 créée: ${transferAmount1.value}€ de Jean Dupont vers Marie Martin (COMPLETED)`);

      // Opération 2: Transfert instantané de Marie Martin (compte 2) vers Thomas Martin (compte 5)
      const transferAmount2 = Amount.create(75.50);
      if (transferAmount2 instanceof Error) throw transferAmount2;
      
      const transferData2 = TransferData.create(
        'Martin',
        'Marie',
        account2Result.iban,
        'Martin',
        'Thomas',
        account5Result.iban,
        true,
        'Cadeau d\'anniversaire'
      );
      if (transferData2 instanceof Error) throw transferData2;
      
      const operation2 = OperationEntity.create(2, transferData2, transferAmount2, 'COMPLETED');
      if (operation2 instanceof Error) throw operation2;
      await operationRepository.save(operation2);
      console.log(`   ✅ Opération 2 créée: ${transferAmount2.value}€ (INSTANT) de Marie Martin vers Thomas Martin (COMPLETED)`);

      // Opération 3: Transfert de Thomas Martin (compte 5) vers Marie Martin (compte 4)
      const transferAmount3 = Amount.create(200.00);
      if (transferAmount3 instanceof Error) throw transferAmount3;
      
      const transferData3 = TransferData.create(
        'Martin',
        'Thomas',
        account5Result.iban,
        'Martin',
        'Marie',
        account4Result.iban,
        false,
        'Loyer du mois'
      );
      if (transferData3 instanceof Error) throw transferData3;
      
      const operation3 = OperationEntity.create(3, transferData3, transferAmount3, 'COMPLETED');
      if (operation3 instanceof Error) throw operation3;
      await operationRepository.save(operation3);
      console.log(`   ✅ Opération 3 créée: ${transferAmount3.value}€ de Thomas Martin vers Marie Martin (COMPLETED)`);

      // Opération 4: Transfert interne de Jean Dupont (compte 1 vers compte 3)
      const transferAmount4 = Amount.create(100.00);
      if (transferAmount4 instanceof Error) throw transferAmount4;
      
      const transferData4 = TransferData.create(
        'Dupont',
        'Jean',
        account1Result.iban,
        'Dupont',
        'Jean',
        account3Result.iban,
        false,
        'Transfert épargne'
      );
      if (transferData4 instanceof Error) throw transferData4;
      
      const operation4 = OperationEntity.create(4, transferData4, transferAmount4, 'COMPLETED');
      if (operation4 instanceof Error) throw operation4;
      await operationRepository.save(operation4);
      console.log(`   ✅ Opération 4 créée: ${transferAmount4.value}€ transfert interne de Jean Dupont (COMPLETED)\n`);
    } else {
      console.log('7️⃣  Opérations non créées (repository non fourni)\n');
    }

    // 8. Créer des ordres dans le carnet d'ordres
    if (orderRepository) {
      console.log('8️⃣  Création des ordres dans le carnet...');
      
      let orderId = 1;

      // ===== ORDRES POUR AAPL =====
      console.log(`   📊 Création d'ordres pour ${symbol1.value}...`);
      
      // Ordres d'achat AAPL (différents prix pour créer un carnet d'ordres réaliste)
      const aaplBuyPrices = [148.00, 148.50, 149.00, 149.50, 150.00, 150.25];
      const aaplBuyQuantities = [10, 15, 20, 8, 12, 5];
      for (let i = 0; i < aaplBuyPrices.length; i++) {
        const price = Amount.create(aaplBuyPrices[i]);
        if (price instanceof Error) throw price;
        const order = OrderEntity.createBuyOrder(orderId++, symbol1, aaplBuyQuantities[i], price, i % 2 === 0 ? 1 : 2);
        if (order instanceof Error) throw order;
        await orderRepository.save(order);
      }
      console.log(`      ✅ ${aaplBuyPrices.length} ordres d'achat ${symbol1.value} créés`);

      // Ordres de vente AAPL
      const aaplSellPrices = [151.00, 151.50, 152.00, 152.50, 153.00, 153.25];
      const aaplSellQuantities = [5, 10, 8, 12, 15, 7];
      for (let i = 0; i < aaplSellPrices.length; i++) {
        const price = Amount.create(aaplSellPrices[i]);
        if (price instanceof Error) throw price;
        const order = OrderEntity.createSellOrder(orderId++, symbol1, aaplSellQuantities[i], price, i % 2 === 0 ? 2 : 1);
        if (order instanceof Error) throw order;
        await orderRepository.save(order);
      }
      console.log(`      ✅ ${aaplSellPrices.length} ordres de vente ${symbol1.value} créés`);

      // Ordre AAPL partiellement exécuté pour Marie Martin
      const buyPricePartial = Amount.create(149.00);
      if (buyPricePartial instanceof Error) throw buyPricePartial;
      const buyOrderPartial = OrderEntity.createBuyOrder(orderId++, symbol1, 20, buyPricePartial, 2);
      if (buyOrderPartial instanceof Error) throw buyOrderPartial;
      const executedQuantity = 12;
      const partialBuyOrder = buyOrderPartial.partiallyExecute(executedQuantity);
      if (partialBuyOrder instanceof Error) throw partialBuyOrder;
      await orderRepository.save(partialBuyOrder);
      console.log(`      ✅ 1 ordre ${symbol1.value} partiellement exécuté créé`);

      // ===== ORDRES POUR GOOGL =====
      console.log(`   📊 Création d'ordres pour ${symbol2.value}...`);
      
      // Ordres d'achat GOOGL
      const googlBuyPrices = [2750.00, 2760.00, 2770.00, 2780.00, 2790.00];
      const googlBuyQuantities = [2, 3, 1, 2, 1];
      for (let i = 0; i < googlBuyPrices.length; i++) {
        const price = Amount.create(googlBuyPrices[i]);
        if (price instanceof Error) throw price;
        const order = OrderEntity.createBuyOrder(orderId++, symbol2, googlBuyQuantities[i], price, i % 2 === 0 ? 1 : 2);
        if (order instanceof Error) throw order;
        await orderRepository.save(order);
      }
      console.log(`      ✅ ${googlBuyPrices.length} ordres d'achat ${symbol2.value} créés`);

      // Ordres de vente GOOGL
      const googlSellPrices = [2810.00, 2820.00, 2830.00, 2840.00, 2850.00];
      const googlSellQuantities = [1, 2, 1, 2, 1];
      for (let i = 0; i < googlSellPrices.length; i++) {
        const price = Amount.create(googlSellPrices[i]);
        if (price instanceof Error) throw price;
        const order = OrderEntity.createSellOrder(orderId++, symbol2, googlSellQuantities[i], price, i % 2 === 0 ? 2 : 1);
        if (order instanceof Error) throw order;
        await orderRepository.save(order);
      }
      console.log(`      ✅ ${googlSellPrices.length} ordres de vente ${symbol2.value} créés`);

      // Ordre GOOGL exécuté (historique)
      const sellPriceExecuted = Amount.create(2850.00);
      if (sellPriceExecuted instanceof Error) throw sellPriceExecuted;
      const sellOrderExecuted = OrderEntity.createSellOrder(orderId++, symbol2, 1, sellPriceExecuted, 1);
      if (sellOrderExecuted instanceof Error) throw sellOrderExecuted;
      const executedSellOrder = sellOrderExecuted.execute();
      await orderRepository.save(executedSellOrder);
      console.log(`      ✅ 1 ordre ${symbol2.value} exécuté créé (historique)`);

      // ===== ORDRES POUR MSFT =====
      console.log(`   📊 Création d'ordres pour ${symbol3.value}...`);
      
      // Ordres d'achat MSFT
      const msftBuyPrices = [3250.00, 3260.00, 3270.00, 3280.00, 3290.00, 3295.00];
      const msftBuyQuantities = [3, 2, 4, 2, 3, 1];
      for (let i = 0; i < msftBuyPrices.length; i++) {
        const price = Amount.create(msftBuyPrices[i]);
        if (price instanceof Error) throw price;
        const order = OrderEntity.createBuyOrder(orderId++, symbol3, msftBuyQuantities[i], price, i % 2 === 0 ? 2 : 1);
        if (order instanceof Error) throw order;
        await orderRepository.save(order);
      }
      console.log(`      ✅ ${msftBuyPrices.length} ordres d'achat ${symbol3.value} créés`);

      // Ordres de vente MSFT
      const msftSellPrices = [3310.00, 3320.00, 3330.00, 3340.00, 3350.00, 3355.00];
      const msftSellQuantities = [2, 3, 2, 4, 3, 1];
      for (let i = 0; i < msftSellPrices.length; i++) {
        const price = Amount.create(msftSellPrices[i]);
        if (price instanceof Error) throw price;
        const order = OrderEntity.createSellOrder(orderId++, symbol3, msftSellQuantities[i], price, i % 2 === 0 ? 1 : 2);
        if (order instanceof Error) throw order;
        await orderRepository.save(order);
      }
      console.log(`      ✅ ${msftSellPrices.length} ordres de vente ${symbol3.value} créés`);

      const totalOrders = orderId - 1;
      console.log(`\n   📊 Total: ${totalOrders} ordres créés dans le carnet d'ordres\n`);
    } else {
      console.log('8️⃣  Ordres non créés (repository non fourni)\n');
    }

    // 9. Créer des bénéficiaires
    if (beneficiaryRepository) {
      console.log('9️⃣  Création des bénéficiaires...');
      
      let beneficiaryId = 1;

      // Bénéficiaires pour Jean Dupont (client 1)
      // Bénéficiaire 1: Un ami (compte externe)
      const beneficiary1 = BeneficiaryEntity.create(
        beneficiaryId++,
        1, // ownerId = Jean Dupont
        'Paul Durand',
        'FR7612345678901234567890123' // IBAN externe valide
      );
      if (beneficiary1 instanceof Error) throw beneficiary1;
      await beneficiaryRepository.save(beneficiary1);
      console.log(`   ✅ Bénéficiaire 1 créé: ${beneficiary1.getName()} - ${beneficiary1.getIban()} (Jean Dupont)`);

      // Bénéficiaire 2: Un autre contact
      const beneficiary2 = BeneficiaryEntity.create(
        beneficiaryId++,
        1,
        'Sophie Laurent',
        'FR7612345678901234567890124'
      );
      if (beneficiary2 instanceof Error) throw beneficiary2;
      await beneficiaryRepository.save(beneficiary2);
      console.log(`   ✅ Bénéficiaire 2 créé: ${beneficiary2.getName()} - ${beneficiary2.getIban()} (Jean Dupont)`);

      // Bénéficiaire 3: Un compte de Marie Martin (compte interne)
      const beneficiary3 = BeneficiaryEntity.create(
        beneficiaryId++,
        1,
        'Marie Martin',
        account2Result.iban.value // IBAN du compte de Marie
      );
      if (beneficiary3 instanceof Error) throw beneficiary3;
      await beneficiaryRepository.save(beneficiary3);
      console.log(`   ✅ Bénéficiaire 3 créé: ${beneficiary3.getName()} - ${beneficiary3.getIban()} (Jean Dupont - compte interne)`);

      // Bénéficiaires pour Marie Martin (client 2)
      // Bénéficiaire 4: Thomas Martin (compte interne - membre de la famille)
      const beneficiary4 = BeneficiaryEntity.create(
        beneficiaryId++,
        2, // ownerId = Marie Martin
        'Thomas Martin',
        account5Result.iban.value // IBAN du compte de Thomas (compte interne)
      );
      if (beneficiary4 instanceof Error) throw beneficiary4;
      await beneficiaryRepository.save(beneficiary4);
      console.log(`   ✅ Bénéficiaire 4 créé: ${beneficiary4.getName()} - ${beneficiary4.getIban()} (Marie Martin - compte interne)`);

      // Bénéficiaire 5: Un compte de Jean Dupont (compte interne)
      const beneficiary5 = BeneficiaryEntity.create(
        beneficiaryId++,
        2,
        'Jean Dupont',
        account1Result.iban.value // IBAN du compte de Jean
      );
      if (beneficiary5 instanceof Error) throw beneficiary5;
      await beneficiaryRepository.save(beneficiary5);
      console.log(`   ✅ Bénéficiaire 5 créé: ${beneficiary5.getName()} - ${beneficiary5.getIban()} (Marie Martin - compte interne)`);

      // Bénéficiaire 6: Un fournisseur externe
      const beneficiary6 = BeneficiaryEntity.create(
        beneficiaryId++,
        2,
        'Entreprise Services Plus',
        'FR7612345678901234567890126' // IBAN externe
      );
      if (beneficiary6 instanceof Error) throw beneficiary6;
      await beneficiaryRepository.save(beneficiary6);
      console.log(`   ✅ Bénéficiaire 6 créé: ${beneficiary6.getName()} - ${beneficiary6.getIban()} (Marie Martin - externe)`);

      // Bénéficiaires pour Thomas Martin (client 5)
      // Bénéficiaire 7: Marie Martin (compte interne)
      const beneficiary7 = BeneficiaryEntity.create(
        beneficiaryId++,
        5, // ownerId = Thomas Martin
        'Marie Martin',
        account2Result.iban.value // IBAN du compte de Marie (compte interne)
      );
      if (beneficiary7 instanceof Error) throw beneficiary7;
      await beneficiaryRepository.save(beneficiary7);
      console.log(`   ✅ Bénéficiaire 7 créé: ${beneficiary7.getName()} - ${beneficiary7.getIban()} (Thomas Martin - compte interne)`);

      // Bénéficiaire 8: Jean Dupont (compte interne)
      const beneficiary8 = BeneficiaryEntity.create(
        beneficiaryId++,
        5,
        'Jean Dupont',
        account1Result.iban.value // IBAN du compte de Jean (compte interne)
      );
      if (beneficiary8 instanceof Error) throw beneficiary8;
      await beneficiaryRepository.save(beneficiary8);
      console.log(`   ✅ Bénéficiaire 8 créé: ${beneficiary8.getName()} - ${beneficiary8.getIban()} (Thomas Martin - compte interne)`);

      const totalBeneficiaries = beneficiaryId - 1;
      console.log(`\n   📊 Total: ${totalBeneficiaries} bénéficiaires créés\n`);
    } else {
      console.log('9️⃣  Bénéficiaires non créés (repository non fourni)\n');
    }

    console.log('✅ Seeding terminé avec succès !\n');
    console.log('📊 Résumé des données créées:');
    console.log('   - 1 banque (AVENIR Bank)');
    console.log('   - 4 utilisateurs (2 clients, 1 conseiller, 1 directeur)');
    console.log('   - 4 comptes bancaires');
    console.log('   - 2 livrets A');
    console.log('   - 3 actions');
    console.log('   - 2 notifications');
    if (operationRepository) {
      console.log('   - 4 opérations');
    }
    if (orderRepository) {
      // Compter les ordres créés
      const allOrders = await orderRepository.findAll();
      const pendingOrders = allOrders.filter(o => o.isPending());
      const executedOrders = allOrders.filter(o => o.isExecuted());
      const partialOrders = allOrders.filter(o => o.isPartiallyExecuted());
      console.log(`   - ${allOrders.length} ordres dans le carnet (${pendingOrders.length} en attente, ${executedOrders.length} exécutés, ${partialOrders.length} partiellement exécutés)`);
      console.log('   - Le prix d\'équilibre sera calculé automatiquement lors de la récupération du carnet d\'ordres');
    }
    if (beneficiaryRepository) {
      // Compter les bénéficiaires créés
      const allBeneficiaries = await beneficiaryRepository.findAll();
      const beneficiariesByClient = new Map<number, number>();
      allBeneficiaries.forEach(b => {
        const count = beneficiariesByClient.get(b.getOwnerId()) || 0;
        beneficiariesByClient.set(b.getOwnerId(), count + 1);
      });
      console.log(`   - ${allBeneficiaries.length} bénéficiaires créés`);
      beneficiariesByClient.forEach((count, clientId) => {
        const client = clientId === 1 ? 'Jean Dupont' : clientId === 2 ? 'Marie Martin' : `Client ${clientId}`;
        console.log(`     • ${count} bénéficiaire(s) pour ${client}`);
      });
    }
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

// Exporter la fonction de seeding et permettre l'exécution directe
export { seed };

if (require.main === module) {
  const userRepository = new UserRepositoryInMemory();
  const accountRepository = new AccountRepositoryInMemory();
  const savingsAccountRepository = new SavingsAccountRepositoryInMemory();
  const bankRepository = new BankRepositoryInMemory();
  const stockRepository = new StockRepositoryInMemory();
  const notificationRepository = new NotificationRepositoryInMemory();
  const beneficiaryRepository = new BeneficiaryRepositoryInMemory();
  const operationRepository = new OperationRepositoryInMemory();
  const orderRepository = new OrderRepositoryInMemory();

  seed(userRepository, accountRepository, savingsAccountRepository, bankRepository, stockRepository, notificationRepository, beneficiaryRepository, operationRepository, orderRepository)
    .then(() => {
      console.log('🎉 Le seeding est terminé !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du seeding:', error);
      process.exit(1);
    });
}

