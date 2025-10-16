import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { BankingController } from '../controllers/BankingController';
import { BankingService } from '../services/BankingService';
import { InMemoryUserRepository } from '../repositories/InMemoryUserRepository';
import { InMemoryBankRepository } from '../repositories/InMemoryBankRepository';
// Import des autres repositories (à créer)
// import { InMemoryAccountRepository } from '../repositories/InMemoryAccountRepository';
// etc.

export class ExpressServer {
  private app: Express;
  private controller: BankingController;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    
    // Configuration middleware
    this.setupMiddleware();
    
    // Initialisation des repositories et services
    this.initializeServices();
    
    // Configuration des routes
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Middleware de logging
    this.app.use((req: Request, res: Response, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private async initializeServices(): Promise<void> {
    // Créer les repositories en mémoire
    const userRepository = new InMemoryUserRepository();
    const bankRepository = new InMemoryBankRepository();
    
    // TODO: Créer les autres repositories
    // const accountRepository = new InMemoryAccountRepository();
    // const savingsAccountRepository = new InMemorySavingsAccountRepository();
    // etc.

    // Créer le service bancaire
    const bankingService = new BankingService(
      userRepository,
      bankRepository,
      {} as any, // accountRepository - à implémenter
      {} as any, // savingsAccountRepository - à implémenter
      {} as any, // operationRepository - à implémenter
      {} as any, // orderRepository - à implémenter
      {} as any, // stockRepository - à implémenter
      {} as any, // creditRepository - à implémenter
      {} as any, // messageRepository - à implémenter
      {} as any  // notificationRepository - à implémenter
    );

    // Initialiser avec des données de test
    await bankingService.initialize();

    // Créer le contrôleur
    this.controller = new BankingController(bankingService);
  }

  private setupRoutes(): void {
    // Route de santé
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'AVENIR Bank API'
      });
    });

    // === AUTHENTICATION ROUTES ===
    this.app.post('/api/auth/login', async (req: Request, res: Response) => {
      const response = await this.controller.login(req.body);
      res.status(response.success ? 200 : 400).json(response);
    });

    this.app.post('/api/auth/register', async (req: Request, res: Response) => {
      const response = await this.controller.register(req.body);
      res.status(response.success ? 201 : 400).json(response);
    });

    // === ACCOUNT ROUTES ===
    this.app.post('/api/accounts', async (req: Request, res: Response) => {
      const response = await this.controller.createAccount(req.body);
      res.status(response.success ? 201 : 400).json(response);
    });

    this.app.post('/api/accounts/savings', async (req: Request, res: Response) => {
      const response = await this.controller.createSavingsAccount(req.body);
      res.status(response.success ? 201 : 400).json(response);
    });

    // === TRANSFER ROUTES ===
    this.app.post('/api/transfers', async (req: Request, res: Response) => {
      const response = await this.controller.createTransfer(req.body);
      res.status(response.success ? 201 : 400).json(response);
    });

    this.app.post('/api/transfers/:id/execute', async (req: Request, res: Response) => {
      const operationId = parseInt(req.params.id);
      const response = await this.controller.executeTransfer(operationId);
      res.status(response.success ? 200 : 400).json(response);
    });

    // === INVESTMENT ROUTES ===
    this.app.post('/api/orders', async (req: Request, res: Response) => {
      const response = await this.controller.createOrder(req.body);
      res.status(response.success ? 201 : 400).json(response);
    });

    this.app.post('/api/orders/:id/execute', async (req: Request, res: Response) => {
      const orderId = parseInt(req.params.id);
      const response = await this.controller.executeOrder(orderId);
      res.status(response.success ? 200 : 400).json(response);
    });

    // === CREDIT ROUTES ===
    this.app.post('/api/credits', async (req: Request, res: Response) => {
      const response = await this.controller.createCredit(req.body);
      res.status(response.success ? 201 : 400).json(response);
    });

    this.app.post('/api/credits/:id/payments', async (req: Request, res: Response) => {
      const creditId = parseInt(req.params.id);
      const response = await this.controller.processPayment({ creditId, ...req.body });
      res.status(response.success ? 200 : 400).json(response);
    });

    // === MESSAGING ROUTES ===
    this.app.post('/api/messages', async (req: Request, res: Response) => {
      const response = await this.controller.sendMessage(req.body);
      res.status(response.success ? 201 : 400).json(response);
    });

    // === ADMIN ROUTES ===
    this.app.put('/api/admin/interest-rate', async (req: Request, res: Response) => {
      const response = await this.controller.updateInterestRate(req.body);
      res.status(response.success ? 200 : 400).json(response);
    });

    this.app.post('/api/admin/calculate-interest', async (req: Request, res: Response) => {
      const response = await this.controller.calculateDailyInterest();
      res.status(response.success ? 200 : 400).json(response);
    });

    // Route 404
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route non trouvée',
        timestamp: new Date().toISOString()
      });
    });

    // Middleware de gestion d'erreurs
    this.app.use((error: any, req: Request, res: Response, next: any) => {
      console.error('Erreur serveur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        timestamp: new Date().toISOString()
      });
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 Serveur AVENIR Bank démarré sur le port ${this.port}`);
        console.log(`📊 API disponible sur http://localhost:${this.port}`);
        console.log(`🏥 Health check: http://localhost:${this.port}/health`);
        resolve();
      });
    });
  }

  public getApp(): Express {
    return this.app;
  }
}
