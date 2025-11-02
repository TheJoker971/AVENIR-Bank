import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateRequest, validators } from '../middleware/validation.middleware';

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

    // PUT /api/bank/interest-rate - Modifier le taux d'épargne (DIRECTOR uniquement)
    this.router.put('/interest-rate',
      validateRequest({
        body: {
          interestRate: validators.nonNegativeNumber
        }
      }),
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const { interestRate } = req.body;

          // Mettre à jour ou créer la banque
          let bank = await this.prisma.bank.findFirst();
          
          if (!bank) {
            bank = await this.prisma.bank.create({
              data: {
                name: 'AVENIR Bank',
                baseInterestRate: interestRate
              }
            });
          } else {
            bank = await this.prisma.bank.update({
              where: { id: bank.id },
              data: { baseInterestRate: interestRate }
            });
          }

          // Notifier tous les clients avec des comptes d'épargne
          const savingsAccounts = await this.prisma.savingsAccount.findMany({
            include: { owner: true }
          });

          // Créer une notification pour chaque client
          for (const account of savingsAccounts) {
            await this.prisma.notification.create({
              data: {
                userId: account.ownerId,
                title: 'Modification du taux d\'épargne',
                content: `Le taux d'épargne a été modifié à ${interestRate}%.`
              }
            });
          }

          res.json({
            message: 'Taux d\'épargne modifié avec succès',
            bank,
            notificationsSent: savingsAccounts.length
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la modification du taux d\'épargne' });
        }
      }
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
