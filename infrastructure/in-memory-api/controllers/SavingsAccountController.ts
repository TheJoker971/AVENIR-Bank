import { Router, Request, Response } from 'express';
import { SavingsAccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { CreateSavingsAccountUseCase } from '../../../application/use-cases/savings/CreateSavingsAccountUseCase';
import { CalculateDailyInterestUseCase } from '../../../application/use-cases/savings/CalculateDailyInterestUseCase';
import { UserRepositoryInMemory } from '../../repositories/in-memory/UserRepositoryInMemory';
import { BankRepositoryInMemory } from '../../repositories/in-memory/BankRepositoryInMemory';
import { NotificationRepositoryInMemory } from '../../repositories/in-memory/NotificationRepositoryInMemory';
import { requireAuth } from '../middlewares/auth';

export class SavingsAccountController {
  private router: Router;
  private createSavingsAccountUseCase: CreateSavingsAccountUseCase;
  private calculateDailyInterestUseCase: CalculateDailyInterestUseCase;

  constructor(
    private savingsAccountRepository: SavingsAccountRepositoryInterface
  ) {
    this.router = Router();
    const userRepository = new UserRepositoryInMemory();
    const bankRepository = new BankRepositoryInMemory();
    const notificationRepository = new NotificationRepositoryInMemory();
    this.createSavingsAccountUseCase = new CreateSavingsAccountUseCase(
      savingsAccountRepository,
      userRepository,
      bankRepository
    );
    this.calculateDailyInterestUseCase = new CalculateDailyInterestUseCase(
      savingsAccountRepository,
      notificationRepository,
      userRepository
    );
    this.setupRoutes();
  }

  private toSavingsAccountDto(account: any): any {
    return {
      id: account.id || 0,
      iban: account.iban?.value || account.iban || '',
      balance: typeof account.balance === 'number' ? account.balance : (account.balance?.value || 0),
      ownerId: account.ownerId || account.ownerID || 0,
      interestRate: typeof account.interestRate === 'number' ? account.interestRate : (account.interestRate?.value || 0),
      createdAt: account.createdAt?.toISOString() || new Date().toISOString(),
      lastInterestCalculation: account.lastInterestCalculation?.toISOString() || new Date().toISOString(),
    };
  }

  private toSavingsAccountDtoArray(accounts: any[]): any[] {
    return accounts.map(account => this.toSavingsAccountDto(account));
  }

  private setupRoutes(): void {
    // GET /api/savings-accounts - Liste tous les comptes d'épargne de l'utilisateur authentifié
    this.router.get('/', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const accounts = await this.savingsAccountRepository.findByOwnerId(userId);
        res.json(this.toSavingsAccountDtoArray(accounts));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des comptes d\'épargne' });
      }
    });

    // POST /api/savings-accounts - Crée un nouveau compte d'épargne (Livret A)
    this.router.post('/', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        
        // Seuls les clients peuvent créer des livrets A
        if (userRole !== 'CLIENT') {
          return res.status(403).json({ error: 'Seuls les clients peuvent ouvrir un Livret A' });
        }

        const { initialAmount } = req.body;
        const amount = initialAmount || 0;

        // Valeurs par défaut pour la banque AVENIR
        const countryCode = 'FR';
        const bankCode = '12345';
        const branchCode = '67890';
        const ribKey = '12';

        const savingsAccount = await this.createSavingsAccountUseCase.execute(
          userId,
          amount,
          countryCode,
          bankCode,
          branchCode,
          ribKey
        );

        if (savingsAccount instanceof Error) {
          return res.status(400).json({ error: savingsAccount.message });
        }

        res.status(201).json(this.toSavingsAccountDto(savingsAccount));
      } catch (error: any) {
        console.error('Erreur lors de la création du compte d\'épargne:', error);
        res.status(500).json({ 
          error: 'Erreur lors de la création du compte d\'épargne',
          details: error.message 
        });
      }
    });

    // GET /api/savings-accounts/:id - Récupère un compte d'épargne par ID
    this.router.get('/:id', requireAuth, async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const account = await this.savingsAccountRepository.findById(id);
        
        if (!account) {
          return res.status(404).json({ error: 'Compte d\'épargne non trouvé' });
        }

        // Vérifier que l'utilisateur est le propriétaire
        const userId = (req as any).userId;
        if (account.getOwnerId() !== userId) {
          return res.status(403).json({ error: 'Accès interdit' });
        }
        
        res.json(this.toSavingsAccountDto(account));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du compte d\'épargne' });
      }
    });

    // GET /api/savings-accounts/:id/total-value - Calcule la valeur totale (solde + intérêts accumulés)
    this.router.get('/:id/total-value', requireAuth, async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const account = await this.savingsAccountRepository.findById(id);
        
        if (!account) {
          return res.status(404).json({ error: 'Compte d\'épargne non trouvé' });
        }

        // Vérifier que l'utilisateur est le propriétaire
        const userId = (req as any).userId;
        if (account.getOwnerId() !== userId) {
          return res.status(403).json({ error: 'Accès interdit' });
        }

        // Calculer les intérêts accumulés et la valeur totale
        const accumulatedInterest = account.calculateAccumulatedInterest();
        const totalValue = account.calculateTotalValue();

        if (accumulatedInterest instanceof Error) {
          return res.status(500).json({ error: 'Erreur lors du calcul des intérêts' });
        }

        if (totalValue instanceof Error) {
          return res.status(500).json({ error: 'Erreur lors du calcul de la valeur totale' });
        }

        res.json({
          id: account.id,
          iban: account.getIban().value,
          balance: account.getBalance().value,
          accumulatedInterest: accumulatedInterest.value,
          totalValue: totalValue.value,
          interestRate: typeof account.interestRate === 'number' ? account.interestRate : (account.interestRate?.value || 0),
          lastInterestCalculation: account.lastInterestCalculation.toISOString(),
        });
      } catch (error: any) {
        res.status(500).json({ error: 'Erreur lors du calcul de la valeur totale', details: error.message });
      }
    });

    // POST /api/savings-accounts/calculate-interests - Déclenche le calcul quotidien des intérêts (DIRECTOR uniquement)
    this.router.post('/calculate-interests', requireAuth, async (req: Request, res: Response) => {
      try {
        const userRole = (req as any).userRole;

        // Seul le directeur peut déclencher le calcul des intérêts
        if (userRole !== 'DIRECTOR') {
          return res.status(403).json({ error: 'Seul le directeur peut déclencher le calcul des intérêts' });
        }

        await this.calculateDailyInterestUseCase.execute();

        res.json({
          message: 'Calcul des intérêts quotidiens effectué avec succès',
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('Erreur lors du calcul des intérêts:', error);
        res.status(500).json({
          error: 'Erreur lors du calcul des intérêts quotidiens',
          details: error.message,
        });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
