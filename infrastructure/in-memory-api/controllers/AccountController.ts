import { Router, Request, Response } from 'express';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { CreateAccountUseCase } from '../../../application/use-cases/account/CreateAccountUseCase';
import { UserRepositoryInMemory } from '../../repositories/in-memory/UserRepositoryInMemory';
import { requireAuth } from '../middlewares/auth';
import { requireAccountOwnership, filterUserAccounts, requireCanCreateAccount } from '../middlewares/accountAuth';

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
    // GET /api/accounts - Liste tous les comptes de l'utilisateur authentifié
    this.router.get('/', requireAuth, filterUserAccounts, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const accounts = await this.accountRepository.findByOwnerId(userId);
        res.json(accounts);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des comptes' });
      }
    });

    // GET /api/accounts/:id - Récupère un compte par ID (seulement si propriétaire)
    this.router.get('/:id', requireAuth, requireAccountOwnership(this.accountRepository), async (req: Request, res: Response) => {
      try {
        const account = (req as any).account;
        res.json(account);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du compte' });
      }
    });

    // GET /api/accounts/by-iban/:iban - Récupère un compte par IBAN (seulement si propriétaire)
    this.router.get('/by-iban/:iban', requireAuth, async (req: Request, res: Response) => {
      try {
        const { Iban } = await import('../../../domain/values/Iban');
        const CountryCode = await import('../../../domain/values/CountryCode');
        const BankCode = await import('../../../domain/values/BankCode');
        const BranchCode = await import('../../../domain/values/BranchCode');
        const AccountNumber = await import('../../../domain/values/AccountNumber');
        const RibKey = await import('../../../domain/values/RibKey');
        
        // Parser l'IBAN pour extraire les composants (simplifié)
        // Format IBAN: FR{2digits}{5digits}{5digits}{11digits}{2digits}
        const ibanStr = req.params.iban;
        if (ibanStr.length !== 27 || !ibanStr.startsWith('FR')) {
          return res.status(400).json({ error: 'Format IBAN invalide' });
        }
        
        const countryCode = ibanStr.substring(0, 2) as any;
        const bankCodeStr = ibanStr.substring(4, 9);
        const branchCodeStr = ibanStr.substring(9, 14);
        const accountNumberStr = ibanStr.substring(14, 25);
        const ribKeyStr = ibanStr.substring(25, 27);
        
        const bankCodeOrError = BankCode.BankCode.create(bankCodeStr);
        const branchCodeOrError = BranchCode.BranchCode.create(branchCodeStr);
        const accountNumberOrError = AccountNumber.AccountNumber.create(accountNumberStr);
        const ribKeyOrError = RibKey.RibKey.create(ribKeyStr);
        
        if (bankCodeOrError instanceof Error) return res.status(400).json({ error: bankCodeOrError.message });
        if (branchCodeOrError instanceof Error) return res.status(400).json({ error: branchCodeOrError.message });
        if (accountNumberOrError instanceof Error) return res.status(400).json({ error: accountNumberOrError.message });
        if (ribKeyOrError instanceof Error) return res.status(400).json({ error: ribKeyOrError.message });
        
        const iban = Iban.create(countryCode, bankCodeOrError, branchCodeOrError, accountNumberOrError, ribKeyOrError);
        
        if (iban instanceof Error) {
          return res.status(400).json({ error: iban.message });
        }
        
        const account = await this.accountRepository.findByIban(iban);
        
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }

        // Vérifier que l'utilisateur est le propriétaire
        const userId = (req as any).userId;
        if (account.ownerId !== userId) {
          return res.status(403).json({ error: 'Accès interdit' });
        }
        
        res.json(account);
      } catch (error: any) {
        res.status(500).json({ error: 'Erreur lors de la récupération du compte', details: error.message });
      }
    });

    // POST /api/accounts - Crée un nouveau compte (avec vérification de permissions)
    this.router.post('/', requireAuth, requireCanCreateAccount(), async (req: Request, res: Response) => {
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

    // DELETE /api/accounts/:id - Supprime un compte (seulement si propriétaire)
    this.router.delete('/:id', requireAuth, requireAccountOwnership(this.accountRepository), async (req: Request, res: Response) => {
      try {
        const accountId = parseInt(req.params.id);
        await this.accountRepository.delete(accountId);
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
