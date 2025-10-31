import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class BankController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/bank - Récupère les informations de la banque
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        let bank = await this.prisma.bank.findFirst();
        
        if (!bank) {
          // Créer une banque par défaut si elle n'existe pas
          bank = await this.prisma.bank.create({
            data: {
              name: 'AVENIR Bank',
              baseInterestRate: 2.5
            }
          });
        }
        
        res.json(bank);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des informations bancaires' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
