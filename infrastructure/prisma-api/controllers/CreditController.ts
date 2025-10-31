import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class CreditController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/credits - Liste tous les crédits
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const credits = await this.prisma.credit.findMany({
          include: { client: true }
        });
        res.json(credits);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des crédits' });
      }
    });

    // GET /api/credits/:id - Récupère un crédit par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const credit = await this.prisma.credit.findUnique({
          where: { id },
          include: { client: true }
        });
        
        if (!credit) {
          return res.status(404).json({ error: 'Crédit non trouvé' });
        }
        
        res.json(credit);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération du crédit' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
