import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { AccountController } from './controllers/AccountController';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { OperationController } from './controllers/OperationController';
import { SavingsAccountController } from './controllers/SavingsAccountController';
import { StockController } from './controllers/StockController';
import { OrderController } from './controllers/OrderController';
import { CreditController } from './controllers/CreditController';
import { MessageController } from './controllers/MessageController';
import { NotificationController } from './controllers/NotificationController';
import { BankController } from './controllers/BankController';
import { BeneficiaryController } from './controllers/BeneficiaryController';
import { PortfolioController } from './controllers/PortfolioController';
import { seed } from './seed';
import { authMiddleware } from './middlewares/authMiddleware';
import { SocketServer } from './socket/socketServer';

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
import { BeneficiaryRepositoryInMemory } from '../repositories/in-memory/BeneficiaryRepositoryInMemory';
import { StockHoldingRepositoryInMemory } from '../repositories/in-memory/StockHoldingRepositoryInMemory';

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialiser le serveur WebSocket
const socketServer = new SocketServer(httpServer);

// Middleware CORS - Accepte toutes les origines localhost
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser toutes les origines localhost (avec ou sans port spécifique)
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Pour le développement, on accepte toutes les origines
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Role']
}));
app.use(express.json());
app.use(authMiddleware);

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
const beneficiaryRepository = new BeneficiaryRepositoryInMemory();
const stockHoldingRepository = new StockHoldingRepositoryInMemory();

// Initialisation des contrôleurs (avec socketServer pour les notifications en temps réel)
const accountController = new AccountController(accountRepository, operationRepository);
const userController = new UserController(userRepository, accountRepository);
const authController = new AuthController(userRepository, accountRepository);
const operationController = new OperationController(operationRepository, accountRepository, userRepository);
const savingsAccountController = new SavingsAccountController(savingsAccountRepository, accountRepository, operationRepository);
const stockController = new StockController(stockRepository, socketServer, orderRepository, stockHoldingRepository);
const orderController = new OrderController(
  orderRepository, 
  stockRepository, 
  accountRepository,
  userRepository,
  stockHoldingRepository,
  operationRepository,
  notificationRepository,
  socketServer
);
const creditController = new CreditController(
  creditRepository,
  accountRepository,
  userRepository,
  notificationRepository,
  operationRepository
);
const messageController = new MessageController(messageRepository, notificationRepository);
const notificationController = new NotificationController(notificationRepository);
const bankController = new BankController(bankRepository, savingsAccountRepository, notificationRepository, userRepository);
const beneficiaryController = new BeneficiaryController(beneficiaryRepository);
const portfolioController = new PortfolioController(stockHoldingRepository, stockRepository);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'AVENIR Bank API - In-Memory',
    version: '1.0.0',
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
      bank: '/api/bank',
      beneficiaries: '/api/beneficiaries',
      portfolio: '/api/portfolio'
    }
  });
});

// Route de seeding des données
app.post('/api/seed', async (req: Request, res: Response) => {
  try {
    await seed(userRepository, accountRepository, savingsAccountRepository, bankRepository, stockRepository, notificationRepository, beneficiaryRepository, operationRepository, orderRepository);
    res.json({ message: 'Données créées avec succès !' });
  } catch (error: any) {
    console.error('Erreur lors du seeding:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes API
app.use('/api/auth', authController.getRouter());
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
app.use('/api/beneficiaries', beneficiaryController.getRouter());
app.use('/api/portfolio', portfolioController.getRouter());

// Démarrage du serveur avec seeding automatique
async function startServer() {
  try {
    // Seed automatique des données au démarrage
    console.log('🌱 Initialisation des données...');
    await seed(
      userRepository,
      accountRepository,
      savingsAccountRepository,
      bankRepository,
      stockRepository,
      notificationRepository,
      beneficiaryRepository,
      operationRepository,
      orderRepository
    );
    console.log('✅ Données initialisées avec succès !\n');
  } catch (error: any) {
    console.error('❌ Erreur lors du seeding automatique:', error);
    // On continue quand même le démarrage du serveur
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 Serveur API In-Memory démarré sur le port ${PORT}`);
    console.log(`📡 Endpoints disponibles sur http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket server ready`);
  });
}

// Démarrer le serveur
startServer();
