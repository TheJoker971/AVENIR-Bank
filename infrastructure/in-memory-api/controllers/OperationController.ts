import { Router, Request, Response } from 'express';
import { OperationRepositoryInterface } from '../../../application/repositories/OperationRepositoryInterface';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { UserRepositoryInterface } from '../../../application/repositories/UserRepositoryInterface';
import { CreateTransferUseCase } from '../../../application/use-cases/operation/CreateTransferUseCase';
import { ExecuteTransferUseCase } from '../../../application/use-cases/operation/ExecuteTransferUseCase';
import { requireAuth } from '../middlewares/auth';

export class OperationController {
  private router: Router;
  private createTransferUseCase: CreateTransferUseCase;
  private executeTransferUseCase: ExecuteTransferUseCase;

  constructor(
    private operationRepository: OperationRepositoryInterface,
    private accountRepository: AccountRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {
    this.router = Router();
    this.createTransferUseCase = new CreateTransferUseCase(operationRepository, accountRepository);
    this.executeTransferUseCase = new ExecuteTransferUseCase(operationRepository, accountRepository);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/operations - Liste toutes les opérations
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const operations = await this.operationRepository.findAll();
        res.json(operations);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des opérations' });
      }
    });

    // GET /api/operations/:id - Récupère une opération par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const operation = await this.operationRepository.findById(id);
        
        if (!operation) {
          return res.status(404).json({ error: 'Opération non trouvée' });
        }
        
        res.json(operation);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'opération' });
      }
    });

    // GET /api/operations/by-account/:iban - Récupère les opérations d'un compte
    this.router.get('/by-account/:iban', async (req: Request, res: Response) => {
      try {
        const iban = req.params.iban;
        const operations = await this.operationRepository.findByAccountIban(iban);
        res.json(operations);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des opérations' });
      }
    });

    // POST /api/operations/transfer - Crée un nouveau virement
    this.router.post('/transfer', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId || req.headers['x-user-id'];
        let userRole = (req as any).userRole || req.headers['x-user-role'];
        
        // Vérifier que userId est défini
        const userIdNumber = typeof userId === 'string' ? parseInt(userId) : userId;
        if (!userIdNumber || isNaN(userIdNumber)) {
          return res.status(401).json({ error: 'Utilisateur non identifié' });
        }
        
        // Récupérer l'utilisateur depuis la base de données pour vérifier le rôle
        const senderUser = await this.userRepository.findById(userIdNumber);
        
        if (senderUser instanceof Error || !senderUser) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Utiliser le rôle de l'utilisateur depuis la base de données
        userRole = senderUser.role.value;
        
        // Seuls les clients peuvent faire des virements
        if (userRole !== 'CLIENT') {
          return res.status(403).json({ error: 'Seuls les clients peuvent effectuer des virements' });
        }

        const {
          senderFirstName,
          senderLastName,
          senderIban,
          receiverFirstName,
          receiverLastName,
          receiverIban,
          amount,
          reason,
          instantTransfer
        } = req.body;

        console.log('📝 Données reçues pour le virement:');
        console.log('   - receiverFirstName:', receiverFirstName);
        console.log('   - receiverLastName:', receiverLastName);
        console.log('   - receiverIban:', receiverIban);

        if (!senderIban || !receiverIban || amount === undefined) {
          return res.status(400).json({ error: 'Paramètres manquants' });
        }

        // Récupérer le compte émetteur
        const { Iban } = await import('../../../domain/values/Iban');
        const { BankCode } = await import('../../../domain/values/BankCode');
        const { BranchCode } = await import('../../../domain/values/BranchCode');
        const { AccountNumber } = await import('../../../domain/values/AccountNumber');
        const { RibKey } = await import('../../../domain/values/RibKey');

        // Parser l'IBAN émetteur
        const senderIbanStr = senderIban.replace(/\s/g, '');
        if (senderIbanStr.length !== 27 || !senderIbanStr.startsWith('FR')) {
          return res.status(400).json({ error: 'Format IBAN émetteur invalide' });
        }

        const senderCountryCode = senderIbanStr.substring(0, 2) as any;
        const senderBankCodeStr = senderIbanStr.substring(4, 9);
        const senderBranchCodeStr = senderIbanStr.substring(9, 14);
        const senderAccountNumberStr = senderIbanStr.substring(14, 25);
        const senderRibKeyStr = senderIbanStr.substring(25, 27);

        const senderBankCodeOrError = BankCode.create(senderBankCodeStr);
        const senderBranchCodeOrError = BranchCode.create(senderBranchCodeStr);
        const senderAccountNumberOrError = AccountNumber.create(senderAccountNumberStr);
        const senderRibKeyOrError = RibKey.create(senderRibKeyStr);

        if (senderBankCodeOrError instanceof Error) return res.status(400).json({ error: senderBankCodeOrError.message });
        if (senderBranchCodeOrError instanceof Error) return res.status(400).json({ error: senderBranchCodeOrError.message });
        if (senderAccountNumberOrError instanceof Error) return res.status(400).json({ error: senderAccountNumberOrError.message });
        if (senderRibKeyOrError instanceof Error) return res.status(400).json({ error: senderRibKeyOrError.message });

        const senderIbanObj = Iban.create(senderCountryCode, senderBankCodeOrError, senderBranchCodeOrError, senderAccountNumberOrError, senderRibKeyOrError);
        if (senderIbanObj instanceof Error) return res.status(400).json({ error: senderIbanObj.message });

        const senderAccount = await this.accountRepository.findByIban(senderIbanObj);
        if (!senderAccount) {
          return res.status(404).json({ error: 'Compte émetteur non trouvé' });
        }

        // Vérifier que le compte émetteur appartient à l'utilisateur
        if (senderAccount.ownerId !== userIdNumber) {
          return res.status(403).json({ error: 'Vous ne pouvez pas effectuer de virement depuis ce compte' });
        }

        // L'utilisateur a déjà été récupéré ci-dessus pour vérifier le rôle

        const finalSenderFirstName = senderFirstName || senderUser.firstname;
        const finalSenderLastName = senderLastName || senderUser.lastname;

        // Parser l'IBAN destinataire
        const receiverIbanStr = receiverIban.replace(/\s/g, '');
        if (receiverIbanStr.length !== 27 || !receiverIbanStr.startsWith('FR')) {
          return res.status(400).json({ error: 'Format IBAN destinataire invalide' });
        }

        const receiverCountryCode = receiverIbanStr.substring(0, 2) as any;
        const receiverBankCodeStr = receiverIbanStr.substring(4, 9);
        const receiverBranchCodeStr = receiverIbanStr.substring(9, 14);
        const receiverAccountNumberStr = receiverIbanStr.substring(14, 25);
        const receiverRibKeyStr = receiverIbanStr.substring(25, 27);

        const receiverBankCodeOrError = BankCode.create(receiverBankCodeStr);
        const receiverBranchCodeOrError = BranchCode.create(receiverBranchCodeStr);
        const receiverAccountNumberOrError = AccountNumber.create(receiverAccountNumberStr);
        const receiverRibKeyOrError = RibKey.create(receiverRibKeyStr);

        if (receiverBankCodeOrError instanceof Error) return res.status(400).json({ error: receiverBankCodeOrError.message });
        if (receiverBranchCodeOrError instanceof Error) return res.status(400).json({ error: receiverBranchCodeOrError.message });
        if (receiverAccountNumberOrError instanceof Error) return res.status(400).json({ error: receiverAccountNumberOrError.message });
        if (receiverRibKeyOrError instanceof Error) return res.status(400).json({ error: receiverRibKeyOrError.message });

        const receiverIbanObj = Iban.create(receiverCountryCode, receiverBankCodeOrError, receiverBranchCodeOrError, receiverAccountNumberOrError, receiverRibKeyOrError);
        if (receiverIbanObj instanceof Error) return res.status(400).json({ error: receiverIbanObj.message });

        // Vérifier que le compte destinataire existe OU que c'est un bénéficiaire du client
        const receiverAccount = await this.accountRepository.findByIban(receiverIbanObj);
        
        console.log('   - receiverAccount exists:', !!receiverAccount);
        
        // Utiliser les valeurs du body en premier lieu
        let finalReceiverFirstName = receiverFirstName || '';
        let finalReceiverLastName = receiverLastName || '';

        if (receiverAccount) {
          // Virement intrabancaire vers un compte existant
          // Récupérer les informations du destinataire
          const receiverUser = await this.userRepository.findById(receiverAccount.ownerId);
          if (!(receiverUser instanceof Error) && receiverUser) {
            finalReceiverFirstName = receiverUser.firstname;
            finalReceiverLastName = receiverUser.lastname;
          }
          console.log('   → Virement interne, noms récupérés du user');
        } else {
          // Virement vers un compte externe (bénéficiaire)
          console.log('   → Virement externe (bénéficiaire)');
          console.log('   - finalReceiverFirstName:', finalReceiverFirstName);
          console.log('   - finalReceiverLastName:', finalReceiverLastName);
          // Vérifier que les informations du bénéficiaire sont fournies
          if (!finalReceiverFirstName || !finalReceiverLastName) {
            return res.status(400).json({ error: 'Nom du bénéficiaire requis pour les virements externes' });
          }
        }

        const operation = await this.createTransferUseCase.execute(
          finalSenderFirstName,
          finalSenderLastName,
          senderIban,
          finalReceiverFirstName,
          finalReceiverLastName,
          receiverIban,
          amount,
          reason,
          instantTransfer || true
        );

        if (operation instanceof Error) {
          console.error('❌ Erreur lors de la création de l\'opération:', operation.message);
          return res.status(400).json({ error: operation.message });
        }

        console.log('✅ Opération créée avec succès, ID:', operation.id);

        // Si le transfert est instantané, l'exécuter immédiatement
        if (instantTransfer !== false) {
          console.log('⚡ Exécution instantanée du virement...');
          const executedOperation = await this.executeTransferUseCase.execute(operation.id);
          if (executedOperation instanceof Error) {
            console.error('❌ Erreur lors de l\'exécution:', executedOperation.message);
            return res.status(400).json({ error: executedOperation.message });
          }
          console.log('✅ Virement exécuté avec succès');
        }

        res.status(201).json(operation);
      } catch (error: any) {
        console.error('Erreur lors de la création du virement:', error);
        res.status(500).json({ error: 'Erreur lors de la création du virement', details: error.message });
      }
    });

    // POST /api/operations/:id/execute - Exécute une opération en attente
    this.router.post('/:id/execute', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const operation = await this.executeTransferUseCase.execute(id);

        if (operation instanceof Error) {
          return res.status(400).json({ error: operation.message });
        }

        res.json(operation);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'exécution de l\'opération' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
