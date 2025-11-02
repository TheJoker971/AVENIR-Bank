import { Router, Request, Response } from 'express';
import { CreditRepositoryInterface } from '../../../application/repositories/CreditRepositoryInterface';

export class CreditController {
  private router: Router;

  constructor(private creditRepository: CreditRepositoryInterface) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/credits - Liste tous les crédits
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const credits = await this.creditRepository.findAll();
        res.json(credits);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des crédits' });
      }
    });

    // GET /api/credits/:id - Récupère un crédit par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const credit = await this.creditRepository.findById(id);
        
        if (!credit) {
          return res.status(404).json({ error: 'Crédit non trouvé' });
        }
        
        res.json(credit);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du crédit' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
