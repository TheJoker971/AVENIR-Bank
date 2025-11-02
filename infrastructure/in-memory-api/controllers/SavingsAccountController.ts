import { Router, Request, Response } from 'express';
import { SavingsAccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';

export class SavingsAccountController {
  private router: Router;

  constructor(private savingsAccountRepository: SavingsAccountRepositoryInterface) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/savings-accounts - Liste tous les comptes d'épargne
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const accounts = await this.savingsAccountRepository.findAll();
        res.json(accounts);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des comptes d\'épargne' });
      }
    });

    // GET /api/savings-accounts/:id - Récupère un compte d'épargne par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const account = await this.savingsAccountRepository.findById(id);
        
        if (!account) {
          return res.status(404).json({ error: 'Compte d\'épargne non trouvé' });
        }
        
        res.json(account);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du compte d\'épargne' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
