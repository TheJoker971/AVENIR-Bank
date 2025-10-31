import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateAccountUseCase } from '../../../application/use-cases/account/CreateAccountUseCase';

export class AccountController {
  private router: Router;
  private createAccountUseCase: CreateAccountUseCase;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    // Pour l'instant, on va créer les use cases avec des adaptateurs Prisma si nécessaire
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/accounts - Liste tous les comptes
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const accounts = await this.prisma.account.findMany({
          include: { owner: true }
        });
        res.json(accounts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des comptes' });
      }
    });

    // GET /api/accounts/:id - Récupère un compte par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const account = await this.prisma.account.findUnique({
          where: { id },
          include: { owner: true }
        });
        
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }
        
        res.json(account);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération du compte' });
      }
    });

    // GET /api/accounts/by-iban/:iban - Récupère un compte par IBAN
    this.router.get('/by-iban/:iban', async (req: Request, res: Response) => {
      try {
        const iban = req.params.iban;
        const account = await this.prisma.account.findUnique({
          where: { iban },
          include: { owner: true }
        });
        
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }
        
        res.json(account);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération du compte' });
      }
    });

    // GET /api/accounts/by-owner/:ownerId - Récupère les comptes d'un propriétaire
    this.router.get('/by-owner/:ownerId', async (req: Request, res: Response) => {
      try {
        const ownerId = parseInt(req.params.ownerId);
        const accounts = await this.prisma.account.findMany({
          where: { ownerId },
          include: { owner: true }
        });
        res.json(accounts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des comptes' });
      }
    });

    // POST /api/accounts - Crée un nouveau compte
    this.router.post('/', async (req: Request, res: Response) => {
      try {
        const { ownerId, iban, accountNumber, initialBalance, accountType } = req.body;

        if (!ownerId || !iban || !accountNumber) {
          return res.status(400).json({ error: 'Paramètres manquants' });
        }

        // Vérifier que l'utilisateur existe
        const user = await this.prisma.user.findUnique({
          where: { id: ownerId }
        });

        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const account = await this.prisma.account.create({
          data: {
            ownerId,
            iban,
            accountNumber,
            balance: initialBalance || 0,
            accountType: accountType || null
          },
          include: { owner: true }
        });

        res.status(201).json(account);
      } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
          return res.status(400).json({ error: 'Un compte avec cet IBAN existe déjà' });
        }
        res.status(500).json({ error: 'Erreur lors de la création du compte' });
      }
    });

    // DELETE /api/accounts/:id - Supprime un compte
    this.router.delete('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        const account = await this.prisma.account.findUnique({
          where: { id }
        });
        
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }

        await this.prisma.account.delete({
          where: { id }
        });
        
        res.status(204).send();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
