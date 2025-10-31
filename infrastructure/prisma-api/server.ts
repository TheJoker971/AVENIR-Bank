import express, { Express, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
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

const app: Express = express();
const PORT = process.env.PORT || 3001; // Port différent de l'API in-memory

// Middleware
app.use(express.json());

// Initialisation du client Prisma
const prisma = new PrismaClient();

// Initialisation des contrôleurs
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

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'AVENIR Bank API - Prisma',
    version: '1.0.0',
    database: 'Prisma ORM',
    endpoints: {
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

// Routes API
app.use('/api/accounts', accountController.getRouter());
app.use('/api/users', userController.getRouter());
app.use('/api/operations', operationController.getRouter());
app.use('/api/savings-accounts', savingsAccountController.getRouter());
app.use('/api/stocks', stockController.getRouter());
app.use('/api/orders', orderController.getRouter());
app.use('/api/credits', creditController.getRouter());
app.use('/api/messages', messageController.getRouter());
app.use('/api/notifications', notificationController.getRouter());
app.use('/api/bank', bankController.getRouter());

// Gestion de l'arrêt propre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API Prisma démarré sur le port ${PORT}`);
  console.log(`📡 Endpoints disponibles sur http://localhost:${PORT}/api`);
});
