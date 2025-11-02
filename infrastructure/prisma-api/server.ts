import express, { Express, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { AccountController } from './controllers/AccountController';
import { UserController } from './controllers/UserController';
import { OperationController } from './controllers/OperationController';
import { SavingsAccountController } from './controllers/SavingsAccountController';
import { StockController } from './controllers/StockController';
import { OrderController } from './controllers/OrderController';
import { CreditController } from './controllers/CreditController';
import { MessageController } from './controllers/MessageController';
import { NotificationController } from './controllers/NotificationController';
import { BankController } from './controllers/BankController';
import { AuthController } from './controllers/AuthController';
import { createAuthMiddleware } from './middleware/auth.middleware';
import { requireClient, requireAdvisor, requireDirector } from './middleware/authorization.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app: Express = express();
const PORT = process.env.PORT || 3001; // Port différent de l'API in-memory

// Initialisation du client Prisma
const prisma = new PrismaClient();

// Middleware globaux
app.use(cors());
app.use(express.json());

// Middleware d'authentification (à utiliser sur les routes protégées)
const authMiddleware = createAuthMiddleware(prisma);

// Initialisation des contrôleurs
const authController = new AuthController(prisma);
const accountController = new AccountController(prisma);
const userController = new UserController(prisma);
const operationController = new OperationController(prisma);
const savingsAccountController = new SavingsAccountController(prisma);
const stockController = new StockController(prisma);
const orderController = new OrderController(prisma);
const creditController = new CreditController(prisma);
const messageController = new MessageController(prisma);
const notificationController = new NotificationController(prisma);
const bankController = new BankController(prisma);

// Routes publiques
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'AVENIR Bank API - Prisma',
    version: '1.0.0',
    database: 'Prisma ORM',
    endpoints: {
      auth: '/api/auth',
      accounts: '/api/accounts',
      users: '/api/users',
      operations: '/api/operations',
      savingsAccounts: '/api/savings-accounts',
      stocks: '/api/stocks',
      orders: '/api/orders',
      credits: '/api/credits',
      messages: '/api/messages',
      notifications: '/api/notifications',
      bank: '/api/bank'
    }
  });
});

// Routes d'authentification (publiques)
app.use('/api/auth', authController.getRouter());

// Routes API protégées par authentification
// Routes clients (authentification requise)
app.use('/api/accounts', authMiddleware, requireClient, accountController.getRouter());
app.use('/api/operations', authMiddleware, requireClient, operationController.getRouter());
app.use('/api/savings-accounts', authMiddleware, requireClient, savingsAccountController.getRouter());
app.use('/api/orders', authMiddleware, requireClient, orderController.getRouter());
app.use('/api/messages', authMiddleware, requireClient, messageController.getRouter());
app.use('/api/notifications', authMiddleware, requireClient, notificationController.getRouter());

// Routes conseillers (authentification + rôle ADVISE)
app.use('/api/credits', authMiddleware, requireAdvisor, creditController.getRouter());
app.use('/api/messages/advisor', authMiddleware, requireAdvisor, messageController.getRouter());

// Routes directeurs (authentification + rôle DIRECTOR)
app.use('/api/users/admin', authMiddleware, requireDirector, userController.getRouter());
app.use('/api/stocks', authMiddleware, requireDirector, stockController.getRouter());
app.use('/api/bank', authMiddleware, requireDirector, bankController.getRouter());

// Routes publiques pour consultation (sans modification)
app.use('/api/stocks/public', stockController.getRouter()); // Consultation seule

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(notFoundHandler);
app.use(errorHandler);

// Gestion de l'arrêt propre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API Prisma démarré sur le port ${PORT}`);
  console.log(`📡 Endpoints disponibles sur http://localhost:${PORT}/api`);
  console.log(`🔐 Authentification requise pour la plupart des routes`);
});
