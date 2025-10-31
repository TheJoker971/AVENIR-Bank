import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class UserController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/users - Liste tous les utilisateurs
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const users = await this.prisma.user.findMany();
        res.json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      }
    });

    // GET /api/users/:id - Récupère un utilisateur par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const user = await this.prisma.user.findUnique({
          where: { id },
          include: {
            accounts: true,
            savingsAccounts: true,
            credits: true
          }
        });
        
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });

    // GET /api/users/by-email/:email - Récupère un utilisateur par email
    this.router.get('/by-email/:email', async (req: Request, res: Response) => {
      try {
        const email = req.params.email;
        const user = await this.prisma.user.findUnique({
          where: { email }
        });
        
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });

    // GET /api/users/by-role/:role - Récupère les utilisateurs par rôle
    this.router.get('/by-role/:role', async (req: Request, res: Response) => {
      try {
        const role = req.params.role;
        const users = await this.prisma.user.findMany({
          where: { role }
        });
        res.json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
