import { UserRepositoryInMemory } from '../repositories/in-memory/UserRepositoryInMemory';
import { AccountRepositoryInMemory, SavingsAccountRepositoryInMemory } from '../repositories/in-memory/AccountRepositoryInMemory';
import { BankRepositoryInMemory } from '../repositories/in-memory/BankRepositoryInMemory';
import { StockRepositoryInMemory } from '../repositories/in-memory/StockRepositoryInMemory';
import { NotificationRepositoryInMemory } from '../repositories/in-memory/NotificationRepositoryInMemory';
import { BeneficiaryRepositoryInMemory } from '../repositories/in-memory/BeneficiaryRepositoryInMemory';

// Import des entités
import { UserEntity } from 'domain/entities/UserEntity';
import { AccountEntity } from 'domain/entities/AccountEntity';
import { SavingsAccountEntity } from 'domain/entities/SavingsAccountEntity';
import { BankEntity } from 'domain/entities/BankEntity';
import { StockEntity } from 'domain/entities/StockEntity';
import { NotificationEntity } from 'domain/entities/NotificationEntity';

// Import des value objects
import { CountryCode } from 'domain/values/CountryCode';
import { BankCode } from 'domain/values/BankCode';
import { BranchCode } from 'domain/values/BranchCode';
import { Amount } from 'domain/values/Amount';
import { StockSymbol } from 'domain/values/StockSymbol';
import { InterestRate } from 'domain/values/InterestRate';
import { Iban } from 'domain/values/Iban';
import { Email } from 'domain/values/Email';

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
  beneficiaryRepository?: BeneficiaryRepositoryInMemory
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
    
    const interestRateOrError = InterestRate.create(2.5);
    if (interestRateOrError instanceof Error) throw interestRateOrError;
    
    const bank = bankResult.updateInterestRate(interestRateOrError);
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
    console.log(`   ✅ Compte 2 créé: IBAN ${account2Result.iban.value}, Solde: ${account2Result.balance.value}€\n`);

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
      interestRateOrError
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
      interestRateOrError
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

    console.log('✅ Seeding terminé avec succès !\n');
    console.log('📊 Résumé des données créées:');
    console.log('   - 1 banque (AVENIR Bank)');
    console.log('   - 4 utilisateurs (2 clients, 1 conseiller, 1 directeur)');
    console.log('   - 2 comptes bancaires');
    console.log('   - 2 livrets A');
    console.log('   - 3 actions');
    console.log('   - 2 notifications\n');

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

  seed(userRepository, accountRepository, savingsAccountRepository, bankRepository, stockRepository, notificationRepository)
    .then(() => {
      console.log('🎉 Le seeding est terminé !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du seeding:', error);
      process.exit(1);
    });
}

