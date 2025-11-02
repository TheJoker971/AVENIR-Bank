/**
 * Contrôleur pour la gestion des bénéficiaires
 */
import { Router, Request, Response } from 'express';
import { BeneficiaryRepositoryInterface } from '../../../application/repositories/BeneficiaryRepositoryInterface';
import { CreateBeneficiaryUseCase } from '../../../application/use-cases/beneficiary/CreateBeneficiaryUseCase';
import { UserRepositoryInMemory } from '../../repositories/in-memory/UserRepositoryInMemory';
import { requireAuth } from '../middlewares/auth';

export class BeneficiaryController {
  private router: Router;
  private createBeneficiaryUseCase: CreateBeneficiaryUseCase;

  constructor(private beneficiaryRepository: BeneficiaryRepositoryInterface) {
    this.router = Router();
    const userRepository = new UserRepositoryInMemory();
    this.createBeneficiaryUseCase = new CreateBeneficiaryUseCase(beneficiaryRepository, userRepository);
    this.setupRoutes();
  }

  private toBeneficiaryDto(beneficiary: any): any {
    return {
      id: beneficiary.id,
      ownerId: beneficiary.ownerId,
      name: beneficiary.name,
      iban: beneficiary.iban,
      createdAt: beneficiary.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  private toBeneficiaryDtoArray(beneficiaries: any[]): any[] {
    return beneficiaries.map(b => this.toBeneficiaryDto(b));
  }

  private setupRoutes(): void {
    // GET /api/beneficiaries - Liste les bénéficiaires de l'utilisateur authentifié
    this.router.get('/', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const beneficiaries = await this.beneficiaryRepository.findByOwnerId(userId);
        res.json(this.toBeneficiaryDtoArray(beneficiaries));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des bénéficiaires' });
      }
    });

    // POST /api/beneficiaries - Crée un nouveau bénéficiaire
    this.router.post('/', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const { name, iban } = req.body;

        if (!name || !iban) {
          return res.status(400).json({ 
            error: 'Paramètres manquants',
            message: 'Les champs name et iban sont requis'
          });
        }

        const beneficiary = await this.createBeneficiaryUseCase.execute(userId, name, iban);

        if (beneficiary instanceof Error) {
          return res.status(400).json({ error: beneficiary.message });
        }

        res.status(201).json(this.toBeneficiaryDto(beneficiary));
      } catch (error: any) {
        console.error('Erreur lors de la création du bénéficiaire:', error);
        res.status(500).json({ 
          error: 'Erreur lors de la création du bénéficiaire',
          details: error.message 
        });
      }
    });

    // DELETE /api/beneficiaries/:id - Supprime un bénéficiaire
    this.router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const id = parseInt(req.params.id);

        const beneficiary = await this.beneficiaryRepository.findById(id);
        if (!beneficiary) {
          return res.status(404).json({ error: 'Bénéficiaire non trouvé' });
        }

        if (beneficiary.ownerId !== userId) {
          return res.status(403).json({ error: 'Vous ne pouvez pas supprimer ce bénéficiaire' });
        }

        await this.beneficiaryRepository.delete(id);
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la suppression du bénéficiaire',
          details: error.message 
        });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

