import express, { Express, Request, Response } from 'express';
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

// Initialisation des repositories in-memory
import { AccountRepositoryInMemory, SavingsAccountRepositoryInMemory } from '../repositories/in-memory/AccountRepositoryInMemory';
import { UserRepositoryInMemory } from '../repositories/in-memory/UserRepositoryInMemory';
import { OperationRepositoryInMemory } from '../repositories/in-memory/OperationRepositoryInMemory';
import { StockRepositoryInMemory } from '../repositories/in-memory/StockRepositoryInMemory';
import { OrderRepositoryInMemory } from '../repositories/in-memory/OrderRepositoryInMemory';
import { CreditRepositoryInMemory } from '../repositories/in-memory/CreditRepositoryInMemory';
import { MessageRepositoryInMemory } from '../repositories/in-memory/MessageRepositoryInMemory';
import { NotificationRepositoryInMemory } from '../repositories/in-memory/NotificationRepositoryInMemory';
import { BankRepositoryInMemory } from '../repositories/in-memory/BankRepositoryInMemory';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialisation des repositories
const accountRepository = new AccountRepositoryInMemory();
const savingsAccountRepository = new SavingsAccountRepositoryInMemory();
const userRepository = new UserRepositoryInMemory();
const operationRepository = new OperationRepositoryInMemory();
const stockRepository = new StockRepositoryInMemory();
const orderRepository = new OrderRepositoryInMemory();
const creditRepository = new CreditRepositoryInMemory();
const messageRepository = new MessageRepositoryInMemory();
const notificationRepository = new NotificationRepositoryInMemory();
const bankRepository = new BankRepositoryInMemory();

// Initialisation des contrôleurs
const accountController = new AccountController(accountRepository);
const userController = new UserController(userRepository);
const operationController = new OperationController(operationRepository, accountRepository);
const savingsAccountController = new SavingsAccountController(savingsAccountRepository);
const stockController = new StockController(stockRepository);
const orderController = new OrderController(orderRepository, stockRepository, accountRepository);
const creditController = new CreditController(creditRepository);
const messageController = new MessageController(messageRepository);
const notificationController = new NotificationController(notificationRepository);
const bankController = new BankController(bankRepository);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'AVENIR Bank API - In-Memory',
    version: '1.0.0',
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API In-Memory démarré sur le port ${PORT}`);
  console.log(`📡 Endpoints disponibles sur http://localhost:${PORT}/api`);
});
