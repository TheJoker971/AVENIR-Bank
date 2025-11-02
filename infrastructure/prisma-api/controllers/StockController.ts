import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateRequest, validators } from '../middleware/validation.middleware';

export class StockController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/stocks/public - Liste toutes les actions (publique, consultation)
    this.router.get('/public', async (req: Request, res: Response) => {
      try {
        const stocks = await this.prisma.stock.findMany({
          select: {
            id: true,
            symbol: true,
            name: true,
            price: true,
            quantity: true
            // On ne retourne pas les ordres pour la consultation publique
          }
        });
        res.json(stocks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des actions' });
      }
    });

    // GET /api/stocks - Liste toutes les actions (avec détails pour DIRECTORS)
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const stocks = await this.prisma.stock.findMany({
          include: { orders: true }
        });
        res.json(stocks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des actions' });
      }
    });

    // GET /api/stocks/:id - Récupère une action par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const stock = await this.prisma.stock.findUnique({
          where: { id },
          include: { orders: true }
        });
        
        if (!stock) {
          return res.status(404).json({ error: 'Action non trouvée' });
        }
        
        res.json(stock);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'action' });
      }
    });

    // POST /api/stocks - Créer une nouvelle action (DIRECTOR uniquement)
    this.router.post('/',
      validateRequest({
        body: {
          symbol: validators.string,
          name: validators.string,
          price: validators.positiveNumber,
          quantity: validators.nonNegativeNumber
        }
      }),
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const { symbol, name, price, quantity } = req.body;

          // Vérifier que le symbole n'existe pas déjà
          const existing = await this.prisma.stock.findUnique({
            where: { symbol }
          });

          if (existing) {
            return res.status(400).json({ error: 'Une action avec ce symbole existe déjà' });
          }

          const stock = await this.prisma.stock.create({
            data: {
              symbol: symbol.toUpperCase(),
              name,
              price,
              quantity: quantity || 0
            }
          });

          res.status(201).json(stock);
        } catch (error: any) {
          console.error(error);
          if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Une action avec ce symbole existe déjà' });
          }
          res.status(500).json({ error: 'Erreur lors de la création de l\'action' });
        }
      }
    );

    // PUT /api/stocks/:id - Modifier une action (DIRECTOR uniquement, sauf le prix)
    this.router.put('/:id',
      validateRequest({
        body: {
          name: 'optional',
          quantity: 'optional'
        }
      }),
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const id = parseInt(req.params.id);
          const { name, quantity } = req.body;

          // Vérifier que l'action existe
          const stock = await this.prisma.stock.findUnique({
            where: { id }
          });

          if (!stock) {
            return res.status(404).json({ error: 'Action non trouvée' });
          }

          // Ne pas permettre la modification du prix manuellement
          // Le prix sera calculé automatiquement par le prix d'équilibre
          const updatedStock = await this.prisma.stock.update({
            where: { id },
            data: {
              ...(name && { name }),
              ...(quantity !== undefined && { quantity })
            }
          });

          res.json(updatedStock);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la modification de l\'action' });
        }
      }
    );

    // DELETE /api/stocks/:id - Supprimer une action (DIRECTOR uniquement)
    this.router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const id = parseInt(req.params.id);

        const stock = await this.prisma.stock.findUnique({
          where: { id }
        });

        if (!stock) {
          return res.status(404).json({ error: 'Action non trouvée' });
        }

        await this.prisma.stock.delete({
          where: { id }
        });

        res.status(204).send();
      } catch (error: any) {
        console.error(error);
        if (error.code === 'P2003') {
          return res.status(400).json({ error: 'Impossible de supprimer cette action car elle est liée à des ordres' });
        }
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'action' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
