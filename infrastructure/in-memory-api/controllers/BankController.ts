import { Router, Request, Response } from 'express';
import { BankRepositoryInterface } from '../../../application/repositories/BankRepositoryInterface';

export class BankController {
  private router: Router;

  constructor(private bankRepository: BankRepositoryInterface) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/bank - Récupère les informations de la banque
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const bank = await this.bankRepository.findById(1); // ID par défaut
        if (!bank) {
          return res.status(404).json({ error: 'Informations bancaires non trouvées' });
        }
        res.json(bank);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des informations bancaires' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
