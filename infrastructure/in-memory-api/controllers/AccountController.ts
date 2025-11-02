import { Router, Request, Response } from 'express';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { CreateAccountUseCase } from '../../../application/use-cases/account/CreateAccountUseCase';
import { UserRepositoryInMemory } from '../../repositories/in-memory/UserRepositoryInMemory';

export class AccountController {
  private router: Router;
  private createAccountUseCase: CreateAccountUseCase;

  constructor(private accountRepository: AccountRepositoryInterface) {
    this.router = Router();
    const userRepository = new UserRepositoryInMemory();
    this.createAccountUseCase = new CreateAccountUseCase(accountRepository, userRepository);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/accounts - Liste tous les comptes
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const accounts = await this.accountRepository.findAll();
        res.json(accounts);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des comptes' });
      }
    });

    // GET /api/accounts/:id - Récupère un compte par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const account = await this.accountRepository.findById(id);
        
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }
        
        res.json(account);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du compte' });
      }
    });

    // GET /api/accounts/by-iban/:iban - Récupère un compte par IBAN
    this.router.get('/by-iban/:iban', async (req: Request, res: Response) => {
      try {
        const { Iban } = await import('../../../domain/values/Iban');
        const iban = Iban.create(req.params.iban);
        
        if (iban instanceof Error) {
          return res.status(400).json({ error: iban.message });
        }
        
        const account = await this.accountRepository.findByIban(iban);
        
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }
        
        res.json(account);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du compte' });
      }
    });

    // GET /api/accounts/by-owner/:ownerId - Récupère les comptes d'un propriétaire
    this.router.get('/by-owner/:ownerId', async (req: Request, res: Response) => {
      try {
        const ownerId = parseInt(req.params.ownerId);
        const accounts = await this.accountRepository.findByOwnerId(ownerId);
        res.json(accounts);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des comptes' });
      }
    });

    // POST /api/accounts - Crée un nouveau compte
    this.router.post('/', async (req: Request, res: Response) => {
      try {
        const { ownerId, countryCode, bankCode, branchCode, ribKey } = req.body;

        if (!ownerId || !countryCode || !bankCode || !branchCode || !ribKey) {
          return res.status(400).json({ error: 'Paramètres manquants' });
        }

        const account = await this.createAccountUseCase.execute(
          ownerId,
          countryCode,
          bankCode,
          branchCode,
          ribKey
        );

        if (account instanceof Error) {
          return res.status(400).json({ error: account.message });
        }

        res.status(201).json(account);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du compte' });
      }
    });

    // PUT /api/accounts/:id - Met à jour un compte
    this.router.put('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const account = await this.accountRepository.findById(id);
        
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }

        // Pour l'instant, on ne permet que la mise à jour du solde
        // L'entité AccountEntity étant immuable, il faudrait créer une nouvelle instance
        res.status(501).json({ error: 'Mise à jour non implémentée (entité immuable)' });
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du compte' });
      }
    });

    // DELETE /api/accounts/:id - Supprime un compte
    this.router.delete('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const exists = await this.accountRepository.exists(id);
        
        if (!exists) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }

        await this.accountRepository.delete(id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
