import { Router, Request, Response } from 'express';
import { OperationRepositoryInterface } from '../../../application/repositories/OperationRepositoryInterface';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { CreateTransferUseCase } from '../../../application/use-cases/operation/CreateTransferUseCase';
import { ExecuteTransferUseCase } from '../../../application/use-cases/operation/ExecuteTransferUseCase';

export class OperationController {
  private router: Router;
  private createTransferUseCase: CreateTransferUseCase;
  private executeTransferUseCase: ExecuteTransferUseCase;

  constructor(
    private operationRepository: OperationRepositoryInterface,
    private accountRepository: AccountRepositoryInterface
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
    this.router.post('/transfer', async (req: Request, res: Response) => {
      try {
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

        if (!senderFirstName || !senderLastName || !senderIban ||
            !receiverFirstName || !receiverLastName || !receiverIban || amount === undefined) {
          return res.status(400).json({ error: 'Paramètres manquants' });
        }

        const operation = await this.createTransferUseCase.execute(
          senderFirstName,
          senderLastName,
          senderIban,
          receiverFirstName,
          receiverLastName,
          receiverIban,
          amount,
          reason,
          instantTransfer
        );

        if (operation instanceof Error) {
          return res.status(400).json({ error: operation.message });
        }

        res.status(201).json(operation);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du virement' });
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
