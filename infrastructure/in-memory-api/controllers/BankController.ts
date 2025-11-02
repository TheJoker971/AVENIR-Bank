import { Router, Request, Response } from 'express';
import { BankRepositoryInterface } from '../../../application/repositories/BankRepositoryInterface';
import { requireAuth, requireRole } from '../middlewares/auth';
import { UpdateInterestRateUseCase } from '../../../application/use-cases/admin/UpdateInterestRateUseCase';
import { SavingsAccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { NotificationRepositoryInterface } from '../../../application/repositories/NotificationRepositoryInterface';
import { UserRepositoryInterface } from '../../../application/repositories/UserRepositoryInterface';

export class BankController {
  private router: Router;
  private updateInterestRateUseCase: UpdateInterestRateUseCase;

  constructor(
    private bankRepository: BankRepositoryInterface,
    private savingsAccountRepository: SavingsAccountRepositoryInterface,
    private notificationRepository: NotificationRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {
    this.router = Router();
    this.updateInterestRateUseCase = new UpdateInterestRateUseCase(
      bankRepository,
      savingsAccountRepository,
      notificationRepository,
      userRepository
    );
    this.setupRoutes();
  }

  private toBankDto(bank: any): any {
    return {
      name: bank?.name || 'AVENIR Bank',
      bankCode: bank?.bankCode?.value || bank?.bankCode || '12345',
      branchCode: bank?.branchCode?.value || bank?.branchCode || '67890',
      interestRate: typeof bank?.interestRate === 'number' 
        ? bank.interestRate 
        : (bank?.interestRate?.value || 0.025), // 2.5% par défaut
    };
  }

  private setupRoutes(): void {
    // GET /api/bank - Récupère les informations de la banque
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const bank = await this.bankRepository.findById(1); // ID par défaut
        if (!bank) {
          return res.status(404).json({ error: 'Informations bancaires non trouvées' });
        }
        res.json(this.toBankDto(bank));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des informations bancaires' });
      }
    });

    // PUT /api/bank/interest-rate - Met à jour le taux d'intérêt (DIRECTOR uniquement)
    this.router.put('/interest-rate', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const { newRate } = req.body;

        if (typeof newRate !== 'number') {
          return res.status(400).json({ 
            error: 'Données invalides',
            message: 'Le nouveau taux doit être un nombre'
          });
        }

        const updatedBank = await this.updateInterestRateUseCase.execute(newRate);
        
        if (updatedBank instanceof Error) {
          return res.status(400).json({ error: updatedBank.message });
        }

        res.json(this.toBankDto(updatedBank));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la mise à jour du taux d\'intérêt',
          details: error.message 
        });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
