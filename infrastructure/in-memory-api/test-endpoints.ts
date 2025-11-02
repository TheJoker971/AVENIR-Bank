import axios, { AxiosError } from 'axios';

// Domain entities
import { UserEntity } from 'domain/entities/UserEntity';
import { AccountEntity } from 'domain/entities/AccountEntity';
import { MessageEntity } from 'domain/entities/MessageEntity';
import { NotificationEntity } from 'domain/entities/NotificationEntity';
import { BankEntity } from 'domain/entities/BankEntity';

// Domain value objects
import { Role } from 'domain/values/Role';
import { CountryCode } from 'domain/values/CountryCode';
import { BankCode } from 'domain/values/BankCode';
import { BranchCode } from 'domain/values/BranchCode';
import { Amount } from 'domain/values/Amount';
import { InterestRate } from 'domain/values/InterestRate';

const BASE_URL = 'http://localhost:3000/api';

/**
 * Utilisateurs de test basés sur le seed, créés avec les entities du domain
 */
const testUsers: UserEntity[] = [
  UserEntity.createClient(1, 'Jean', 'Dupont', 'jean.dupont@example.com', 'MotDePasse123!', '123 Rue de la République, Paris'),
  UserEntity.createClient(2, 'Marie', 'Martin', 'marie.martin@example.com', 'MotDePasse456!', '456 Avenue des Champs, Lyon'),
  UserEntity.createAdvise(3, 'Pierre', 'Dubois', 'pierre.dubois@avenir.fr', 'MotDePasse789!', '789 Boulevard de la Finance, Paris'),
  UserEntity.createDirector(4, 'Sophie', 'Bernard', 'sophie.bernard@avenir.fr', 'MotDePasseAdmin123!', '789 Boulevard de la Finance, Paris'),
].filter((user): user is UserEntity => !(user instanceof Error)) as UserEntity[];

/**
 * Fonction utilitaire pour créer les headers d'authentification
 */
function getAuthHeaders(user: UserEntity) {
  return {
    'X-User-Id': user.id.toString(),
    'X-User-Role': user.role.value,
    'Content-Type': 'application/json',
  };
}

/**
 * Fonction utilitaire pour obtenir le nom complet d'un utilisateur
 */
function getUserFullName(user: UserEntity): string {
  return `${user.firstname} ${user.lastname}`;
}

/**
 * Fonction utilitaire pour formater les erreurs
 */
function formatError(error: any): string {
  if (error.response) {
    return `[${error.response.status}] ${error.response.data.error || error.response.data.message || 'Erreur inconnue'}`;
  }
  return error.message || 'Erreur inconnue';
}

/**
 * Fonction utilitaire pour tester un endpoint avec gestion des erreurs
 */
async function testEndpoint(
  name: string,
  testFn: () => Promise<any>,
  expectedSuccess: boolean = true
): Promise<boolean> {
  try {
    const result = await testFn();
    if (expectedSuccess) {
      console.log(`   ✅ ${name}`);
      return true;
    } else {
      console.log(`   ⚠️  ${name} (a réussi alors qu'on attendait un échec)`);
      return false;
    }
  } catch (error: any) {
    if (!expectedSuccess) {
      console.log(`   ✅ ${name} (erreur attendue: ${formatError(error)})`);
      return true;
    } else {
      console.log(`   ❌ ${name} (erreur: ${formatError(error)})`);
      return false;
    }
  }
}

/**
 * Helper pour créer un compte avec les value objects du domain
 */
function createAccountData(ownerId: number): {
  ownerId: number;
  countryCode: CountryCode;
  bankCode: string;
  branchCode: string;
  ribKey: string;
} {
  return {
    ownerId,
    countryCode: 'FR' as CountryCode,
    bankCode: '12345',
    branchCode: '67890',
    ribKey: Math.floor(Math.random() * 90 + 10).toString(), // Génère un RIB key aléatoire
  };
}

/**
 * Tests pour les comptes (accounts)
 */
async function testAccounts() {
  console.log('\n📁 === Tests des Endpoints Comptes ===\n');

  const client1 = testUsers[0]; // Jean Dupont (CLIENT, ID: 1)
  const client2 = testUsers[1]; // Marie Martin (CLIENT, ID: 2)
  const advisor = testUsers[2]; // Pierre Dubois (ADVISE, ID: 3)
  const director = testUsers[3]; // Sophie Bernard (DIRECTOR, ID: 4)

  let successCount = 0;
  let totalTests = 0;

  // Test 1: CLIENT peut voir ses propres comptes
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client1)}) peut lister ses propres comptes`,
    async () => {
      const response = await axios.get(`${BASE_URL}/accounts`, {
        headers: getAuthHeaders(client1),
      });
      // Vérifier que tous les comptes retournés utilisent les structures du domain
      if (Array.isArray(response.data)) {
        response.data.forEach((account: any) => {
          if (!account.iban || !account.iban.value) {
            throw new Error('Structure IBAN invalide dans la réponse');
          }
          if (!account.balance || !account.balance.value) {
            throw new Error('Structure Balance invalide dans la réponse');
          }
        });
      }
      return response.data;
    }
  )) successCount++;

  // Test 2: CLIENT ne peut pas voir les comptes d'autres utilisateurs
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client2)}) ne voit que ses propres comptes`,
    async () => {
      const response = await axios.get(`${BASE_URL}/accounts`, {
        headers: getAuthHeaders(client2),
      });
      // Vérifier que tous les comptes appartiennent à client2
      const allOwned = response.data.every((account: any) => account.ownerId === client2.id);
      if (!allOwned) throw new Error('Le client peut voir des comptes qui ne lui appartiennent pas');
      return response.data;
    }
  )) successCount++;

  // Test 3: CLIENT peut créer un compte pour lui-même
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client1)}) peut créer un compte pour lui-même`,
    async () => {
      const accountData = createAccountData(client1.id);
      const response = await axios.post(
        `${BASE_URL}/accounts`,
        accountData,
        { headers: getAuthHeaders(client1) }
      );
      // Vérifier la structure de la réponse avec les value objects
      if (!response.data.iban || !response.data.iban.value) {
        throw new Error('Structure IBAN invalide dans la réponse');
      }
      if (!response.data.balance || response.data.balance.value === undefined) {
        throw new Error('Structure Balance invalide dans la réponse');
      }
      return response.data;
    }
  )) successCount++;

  // Test 4: CLIENT ne peut pas créer un compte pour quelqu'un d'autre
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client1)}) ne peut PAS créer un compte pour un autre utilisateur`,
    async () => {
      const accountData = createAccountData(client2.id); // Essayer de créer pour client2
      await axios.post(
        `${BASE_URL}/accounts`,
        accountData,
        { headers: getAuthHeaders(client1) }
      );
    },
    false // On attend un échec
  )) successCount++;

  // Test 5: ADVISE peut créer un compte pour un client
  totalTests++;
  if (await testEndpoint(
    `ADVISE (${getUserFullName(advisor)}) peut créer un compte pour un client`,
    async () => {
      const accountData = createAccountData(client1.id);
      const response = await axios.post(
        `${BASE_URL}/accounts`,
        accountData,
        { headers: getAuthHeaders(advisor) }
      );
      // Vérifier que le rôle ADVISE permet cette opération
      if (advisor.role.value !== 'ADVISE') {
        throw new Error('Le rôle devrait être ADVISE');
      }
      return response.data;
    }
  )) successCount++;

  // Test 6: DIRECTOR peut créer un compte pour un client
  totalTests++;
  if (await testEndpoint(
    `DIRECTOR (${getUserFullName(director)}) peut créer un compte pour un client`,
    async () => {
      const accountData = createAccountData(client2.id);
      const response = await axios.post(
        `${BASE_URL}/accounts`,
        accountData,
        { headers: getAuthHeaders(director) }
      );
      // Vérifier que le rôle DIRECTOR permet cette opération
      if (director.role.value !== 'DIRECTOR') {
        throw new Error('Le rôle devrait être DIRECTOR');
      }
      return response.data;
    }
  )) successCount++;

  // Test 7: Accès sans authentification doit échouer
  totalTests++;
  if (await testEndpoint(
    `Accès aux comptes sans authentification doit échouer`,
    async () => {
      await axios.get(`${BASE_URL}/accounts`);
    },
    false // On attend un échec
  )) successCount++;

  console.log(`\n   📊 Résultat: ${successCount}/${totalTests} tests réussis\n`);
  return { successCount, totalTests };
}

/**
 * Tests pour les messages
 */
async function testMessages() {
  console.log('\n💬 === Tests des Endpoints Messages ===\n');

  const client1 = testUsers[0]; // Jean Dupont (CLIENT, ID: 1)
  const client2 = testUsers[1]; // Marie Martin (CLIENT, ID: 2)
  const advisor = testUsers[2]; // Pierre Dubois (ADVISE, ID: 3)
  const director = testUsers[3]; // Sophie Bernard (DIRECTOR, ID: 4)

  let successCount = 0;
  let totalTests = 0;
  let createdMessageId: number | null = null;

  // Test 1: CLIENT peut envoyer un message
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client1)}) peut envoyer un message`,
    async () => {
      const messageText = 'Bonjour, j\'aimerais des conseils sur mon épargne.';
      const response = await axios.post(
        `${BASE_URL}/messages`,
        {
          receiverId: advisor.id,
          message: messageText,
        },
        { headers: getAuthHeaders(client1) }
      );
      // Vérifier la structure du message retourné
      if (response.data.senderId !== client1.id) {
        throw new Error('L\'expéditeur du message n\'est pas correct');
      }
      if (response.data.receiverId !== advisor.id) {
        throw new Error('Le destinataire du message n\'est pas correct');
      }
      if (response.data.message !== messageText) {
        throw new Error('Le contenu du message n\'est pas correct');
      }
      createdMessageId = response.data.id;
      return response.data;
    }
  )) successCount++;

  // Test 2: ADVISE peut envoyer un message
  totalTests++;
  if (await testEndpoint(
    `ADVISE (${getUserFullName(advisor)}) peut envoyer un message`,
    async () => {
      const messageText = 'Bonjour, je serais ravi de vous aider avec votre épargne.';
      const response = await axios.post(
        `${BASE_URL}/messages`,
        {
          receiverId: client1.id,
          message: messageText,
        },
        { headers: getAuthHeaders(advisor) }
      );
      // Vérifier que le rôle ADVISE permet d'envoyer des messages
      if (advisor.role.value !== 'ADVISE') {
        throw new Error('Le rôle devrait être ADVISE');
      }
      return response.data;
    }
  )) successCount++;

  // Test 3: DIRECTOR ne peut PAS envoyer un message
  totalTests++;
  if (await testEndpoint(
    `DIRECTOR (${getUserFullName(director)}) ne peut PAS envoyer un message`,
    async () => {
      await axios.post(
        `${BASE_URL}/messages`,
        {
          receiverId: client1.id,
          message: 'Ce message ne devrait pas être créé.',
        },
        { headers: getAuthHeaders(director) }
      );
    },
    false // On attend un échec
  )) successCount++;

  // Test 4: CLIENT peut voir ses propres messages
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client1)}) peut voir ses propres messages`,
    async () => {
      const response = await axios.get(`${BASE_URL}/messages`, {
        headers: getAuthHeaders(client1),
      });
      // Vérifier que tous les messages concernent client1
      const allRelevant = response.data.every(
        (msg: any) => msg.senderId === client1.id || msg.receiverId === client1.id
      );
      if (!allRelevant) throw new Error('Le client peut voir des messages qui ne le concernent pas');
      return response.data;
    }
  )) successCount++;

  // Test 5: Un utilisateur ne peut pas voir les messages d'autres utilisateurs
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client2)}) ne voit que ses propres messages`,
    async () => {
      const response = await axios.get(`${BASE_URL}/messages`, {
        headers: getAuthHeaders(client2),
      });
      // Vérifier que tous les messages concernent client2
      const allRelevant = response.data.every(
        (msg: any) => msg.senderId === client2.id || msg.receiverId === client2.id
      );
      if (!allRelevant) throw new Error('Le client peut voir des messages qui ne le concernent pas');
      return response.data;
    }
  )) successCount++;

  // Test 6: Lecture d'un message spécifique (si créé précédemment)
  if (createdMessageId) {
    totalTests++;
    if (await testEndpoint(
      `CLIENT (${getUserFullName(client1)}) peut lire un message qu'il a envoyé`,
      async () => {
        const response = await axios.get(`${BASE_URL}/messages/${createdMessageId}`, {
          headers: getAuthHeaders(client1),
        });
        // Vérifier que le message retourné correspond à celui créé
        if (response.data.id !== createdMessageId) {
          throw new Error('Le message retourné ne correspond pas à celui demandé');
        }
        return response.data;
      }
    )) successCount++;

    // Test 7: Un autre utilisateur ne peut pas lire ce message
    totalTests++;
    if (await testEndpoint(
      `CLIENT (${getUserFullName(client2)}) ne peut PAS lire un message qui ne le concerne pas`,
      async () => {
        await axios.get(`${BASE_URL}/messages/${createdMessageId}`, {
          headers: getAuthHeaders(client2),
        });
      },
      false // On attend un échec
    )) successCount++;
  }

  // Test 8: Accès sans authentification doit échouer
  totalTests++;
  if (await testEndpoint(
    `Accès aux messages sans authentification doit échouer`,
    async () => {
      await axios.get(`${BASE_URL}/messages`);
    },
    false // On attend un échec
  )) successCount++;

  console.log(`\n   📊 Résultat: ${successCount}/${totalTests} tests réussis\n`);
  return { successCount, totalTests };
}

/**
 * Tests pour les notifications
 */
async function testNotifications() {
  console.log('\n🔔 === Tests des Endpoints Notifications ===\n');

  const client1 = testUsers[0]; // Jean Dupont (CLIENT, ID: 1)
  const client2 = testUsers[1]; // Marie Martin (CLIENT, ID: 2)

  let successCount = 0;
  let totalTests = 0;

  // Test 1: CLIENT peut voir ses propres notifications
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client1)}) peut voir ses propres notifications`,
    async () => {
      const response = await axios.get(`${BASE_URL}/notifications`, {
        headers: getAuthHeaders(client1),
      });
      // Vérifier que toutes les notifications appartiennent à client1
      const allOwned = response.data.every((notif: any) => notif.recipientId === client1.id || notif.userId === client1.id);
      if (!allOwned) throw new Error('Le client peut voir des notifications qui ne lui appartiennent pas');
      // Vérifier la structure des notifications
      response.data.forEach((notif: any) => {
        if (!notif.title || !notif.message) {
          throw new Error('Structure de notification invalide');
        }
      });
      return response.data;
    }
  )) successCount++;

  // Test 2: CLIENT ne peut pas voir les notifications d'autres utilisateurs
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client2)}) ne voit que ses propres notifications`,
    async () => {
      const response = await axios.get(`${BASE_URL}/notifications`, {
        headers: getAuthHeaders(client2),
      });
      const allOwned = response.data.every((notif: any) => notif.recipientId === client2.id || notif.userId === client2.id);
      if (!allOwned) throw new Error('Le client peut voir des notifications qui ne lui appartiennent pas');
      return response.data;
    }
  )) successCount++;

  // Test 3: Accès sans authentification doit échouer
  totalTests++;
  if (await testEndpoint(
    `Accès aux notifications sans authentification doit échouer`,
    async () => {
      await axios.get(`${BASE_URL}/notifications`);
    },
    false // On attend un échec
  )) successCount++;

  console.log(`\n   📊 Résultat: ${successCount}/${totalTests} tests réussis\n`);
  return { successCount, totalTests };
}

/**
 * Tests pour la banque (bank)
 */
async function testBank() {
  console.log('\n🏦 === Tests des Endpoints Banque ===\n');

  const client1 = testUsers[0]; // Jean Dupont (CLIENT, ID: 1)
  const advisor = testUsers[2]; // Pierre Dubois (ADVISE, ID: 3)
  const director = testUsers[3]; // Sophie Bernard (DIRECTOR, ID: 4)

  let successCount = 0;
  let totalTests = 0;

  // Test 1: Endpoint GET /api/bank est public (accessible sans authentification)
  totalTests++;
  if (await testEndpoint(
    `GET /api/bank est accessible sans authentification`,
    async () => {
      const response = await axios.get(`${BASE_URL}/bank`);
      // Vérifier la structure de la réponse avec les value objects
      if (!response.data.interestRate || !response.data.interestRate.value) {
        throw new Error('Structure InterestRate invalide dans la réponse');
      }
      if (!response.data.name) {
        throw new Error('Le nom de la banque est manquant');
      }
      return response.data;
    }
  )) successCount++;

  // Test 2: CLIENT ne peut PAS modifier le taux d'intérêt
  totalTests++;
  if (await testEndpoint(
    `CLIENT (${getUserFullName(client1)}) ne peut PAS modifier le taux d'intérêt`,
    async () => {
      const newRate = 3.0;
      await axios.put(
        `${BASE_URL}/bank/interest-rate`,
        { newRate },
        { headers: getAuthHeaders(client1) }
      );
    },
    false // On attend un échec
  )) successCount++;

  // Test 3: ADVISE ne peut PAS modifier le taux d'intérêt
  totalTests++;
  if (await testEndpoint(
    `ADVISE (${getUserFullName(advisor)}) ne peut PAS modifier le taux d'intérêt`,
    async () => {
      const newRate = 3.0;
      await axios.put(
        `${BASE_URL}/bank/interest-rate`,
        { newRate },
        { headers: getAuthHeaders(advisor) }
      );
    },
    false // On attend un échec
  )) successCount++;

  // Test 4: DIRECTOR peut modifier le taux d'intérêt
  totalTests++;
  if (await testEndpoint(
    `DIRECTOR (${getUserFullName(director)}) peut modifier le taux d'intérêt`,
    async () => {
      const newRate = 3.5;
      // Créer un InterestRate value object pour valider le taux
      const interestRateOrError = InterestRate.create(newRate);
      if (interestRateOrError instanceof Error) {
        throw new Error(`Taux d'intérêt invalide: ${interestRateOrError.message}`);
      }

      const response = await axios.put(
        `${BASE_URL}/bank/interest-rate`,
        { newRate },
        { headers: getAuthHeaders(director) }
      );
      
      // Vérifier que le taux a bien été modifié avec la structure du domain
      if (!response.data.interestRate || response.data.interestRate.value !== newRate) {
        throw new Error('Le taux d\'intérêt n\'a pas été correctement modifié');
      }
      
      // Vérifier que le rôle DIRECTOR permet cette opération
      if (director.role.value !== 'DIRECTOR') {
        throw new Error('Le rôle devrait être DIRECTOR');
      }
      
      return response.data;
    }
  )) successCount++;

  // Test 5: Modification du taux d'intérêt sans authentification doit échouer
  totalTests++;
  if (await testEndpoint(
    `Modification du taux d'intérêt sans authentification doit échouer`,
    async () => {
      await axios.put(`${BASE_URL}/bank/interest-rate`, { newRate: 4.0 });
    },
    false // On attend un échec
  )) successCount++;

  console.log(`\n   📊 Résultat: ${successCount}/${totalTests} tests réussis\n`);
  return { successCount, totalTests };
}

/**
 * Tests pour les utilisateurs (users)
 */
async function testUsersEndpoints() {
  console.log('\n👥 === Tests des Endpoints Utilisateurs ===\n');

  let successCount = 0;
  let totalTests = 0;

  // Test 1: Liste des utilisateurs est accessible sans authentification
  totalTests++;
  if (await testEndpoint(
    `GET /api/users est accessible sans authentification`,
    async () => {
      const response = await axios.get(`${BASE_URL}/users`);
      if (!Array.isArray(response.data)) {
        throw new Error('La réponse devrait être un tableau');
      }
      // Vérifier que les utilisateurs retournés utilisent les structures du domain
      response.data.forEach((user: any) => {
        if (!user.role || !user.role.value) {
          throw new Error('Structure Role invalide dans la réponse');
        }
        if (!user.email || !user.email.value) {
          throw new Error('Structure Email invalide dans la réponse');
        }
      });
      return response.data;
    }
  )) successCount++;

  // Test 2: Récupérer un utilisateur spécifique
  totalTests++;
  if (await testEndpoint(
    `GET /api/users/1 récupère l'utilisateur ID 1`,
    async () => {
      const response = await axios.get(`${BASE_URL}/users/1`);
      if (response.data.id !== 1) {
        throw new Error('L\'utilisateur retourné n\'a pas le bon ID');
      }
      // Vérifier la structure avec les value objects
      if (!response.data.role || !response.data.role.value) {
        throw new Error('Structure Role invalide');
      }
      if (!response.data.email || !response.data.email.value) {
        throw new Error('Structure Email invalide');
      }
      return response.data;
    }
  )) successCount++;

  // Test 3: Recherche par email
  totalTests++;
  if (await testEndpoint(
    `GET /api/users/by-email/jean.dupont@example.com trouve l'utilisateur`,
    async () => {
      const testEmail = 'jean.dupont@example.com';
      const response = await axios.get(`${BASE_URL}/users/by-email/${testEmail}`);
      // Vérifier avec Email value object
      if (!response.data.email || response.data.email.value !== testEmail) {
        throw new Error('L\'email ne correspond pas');
      }
      return response.data;
    }
  )) successCount++;

  // Test 4: Recherche par rôle
  totalTests++;
  if (await testEndpoint(
    `GET /api/users/by-role/CLIENT trouve les clients`,
    async () => {
      const testRole = 'CLIENT';
      const response = await axios.get(`${BASE_URL}/users/by-role/${testRole}`);
      if (!Array.isArray(response.data)) {
        throw new Error('La réponse devrait être un tableau');
      }
      // Vérifier que tous les utilisateurs sont des clients avec Role value object
      const allClients = response.data.every((user: any) => {
        return user.role && user.role.value === testRole;
      });
      if (!allClients) {
        throw new Error('Tous les utilisateurs devraient être des clients');
      }
      return response.data;
    }
  )) successCount++;

  console.log(`\n   📊 Résultat: ${successCount}/${totalTests} tests réussis\n`);
  return { successCount, totalTests };
}

/**
 * Tests généraux d'authentification
 */
async function testAuthentication() {
  console.log('\n🔐 === Tests d\'Authentification Généraux ===\n');

  const client1 = testUsers[0];

  let successCount = 0;
  let totalTests = 0;

  // Test 1: Accès sans header X-User-Id doit échouer
  totalTests++;
  if (await testEndpoint(
    `Accès sans header X-User-Id doit échouer`,
    async () => {
      await axios.get(`${BASE_URL}/accounts`, {
        headers: { 'X-User-Role': client1.role.value },
      });
    },
    false // On attend un échec
  )) successCount++;

  // Test 2: Accès avec header X-User-Id invalide doit échouer
  totalTests++;
  if (await testEndpoint(
    `Accès avec header X-User-Id invalide doit échouer`,
    async () => {
      await axios.get(`${BASE_URL}/accounts`, {
        headers: { 'X-User-Id': 'not-a-number', 'X-User-Role': client1.role.value },
      });
    },
    false // On attend un échec
  )) successCount++;

  // Test 3: Accès avec rôle incorrect pour un endpoint protégé
  totalTests++;
  if (await testEndpoint(
    `Accès avec rôle incorrect pour modifier le taux d'intérêt doit échouer`,
    async () => {
      await axios.put(
        `${BASE_URL}/bank/interest-rate`,
        { newRate: 3.0 },
        {
          headers: {
            'X-User-Id': client1.id.toString(),
            'X-User-Role': client1.role.value, // CLIENT ne peut pas modifier
          },
        }
      );
    },
    false // On attend un échec
  )) successCount++;

  console.log(`\n   📊 Résultat: ${successCount}/${totalTests} tests réussis\n`);
  return { successCount, totalTests };
}

/**
 * Script principal de test
 */
async function testEndpoints() {
  console.log('🧪 ==========================================');
  console.log('🧪 Tests des Endpoints AVENIR Bank');
  console.log('🧪 Utilisation des Entities et Value Objects du Domain');
  console.log('🧪 ==========================================\n');

  console.log('⚠️  Assurez-vous que le serveur est démarré sur http://localhost:3000');
  console.log('⚠️  Assurez-vous que les données ont été seedées (npm run seed)\n');

  // Vérifier que les utilisateurs de test sont valides
  if (testUsers.length !== 4) {
    console.error('❌ Erreur: Les utilisateurs de test n\'ont pas été créés correctement');
    process.exit(1);
  }

  console.log('👥 Utilisateurs de test:');
  const usersList = testUsers;
  usersList.forEach((user: UserEntity) => {
    console.log(`   - ${getUserFullName(user)} (ID: ${user.id}, Rôle: ${user.role.value})`);
  });
  console.log('');

  const results: { category: string; success: number; total: number }[] = [];

  try {
    // Tests d'authentification
    const authResults = await testAuthentication();
    results.push({ category: 'Authentification', success: authResults.successCount, total: authResults.totalTests });

    // Tests des utilisateurs
    const usersResults = await testUsersEndpoints();
    results.push({ category: 'Utilisateurs', success: usersResults.successCount, total: usersResults.totalTests });

    // Tests des comptes
    const accountsResults = await testAccounts();
    results.push({ category: 'Comptes', success: accountsResults.successCount, total: accountsResults.totalTests });

    // Tests des messages
    const messagesResults = await testMessages();
    results.push({ category: 'Messages', success: messagesResults.successCount, total: messagesResults.totalTests });

    // Tests des notifications
    const notificationsResults = await testNotifications();
    results.push({ category: 'Notifications', success: notificationsResults.successCount, total: notificationsResults.totalTests });

    // Tests de la banque
    const bankResults = await testBank();
    results.push({ category: 'Banque', success: bankResults.successCount, total: bankResults.totalTests });

    // Résumé final
    console.log('\n📊 ==========================================');
    console.log('📊 Résumé des Tests');
    console.log('📊 ==========================================\n');

    let totalSuccess = 0;
    let totalTests = 0;

    results.forEach((result) => {
      const percentage = ((result.success / result.total) * 100).toFixed(1);
      const status = result.success === result.total ? '✅' : '⚠️';
      console.log(`${status} ${result.category}: ${result.success}/${result.total} (${percentage}%)`);
      totalSuccess += result.success;
      totalTests += result.total;
    });

    const globalPercentage = ((totalSuccess / totalTests) * 100).toFixed(1);
    console.log('\n' + '='.repeat(50));
    console.log(`📊 TOTAL: ${totalSuccess}/${totalTests} tests réussis (${globalPercentage}%)`);
    console.log('='.repeat(50) + '\n');

    if (totalSuccess === totalTests) {
      console.log('🎉 Tous les tests sont passés avec succès !\n');
      return;
    } else {
      console.log('⚠️  Certains tests ont échoué. Veuillez vérifier les résultats ci-dessus.\n');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Erreur fatale lors des tests:', error.message);
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
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec des tests:', error);
      process.exit(1);
    });
}
