import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class OperationController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/operations - Liste toutes les opérations
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const operations = await this.prisma.operation.findMany({
          include: { account: true }
        });
        res.json(operations);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des opérations' });
      }
    });

    // GET /api/operations/:id - Récupère une opération par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const operation = await this.prisma.operation.findUnique({
          where: { id },
          include: { account: true }
        });
        
        if (!operation) {
          return res.status(404).json({ error: 'Opération non trouvée' });
        }
        
        res.json(operation);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'opération' });
      }
    });

    // GET /api/operations/by-account/:iban - Récupère les opérations d'un compte
    this.router.get('/by-account/:iban', async (req: Request, res: Response) => {
      try {
        const iban = req.params.iban;
        const account = await this.prisma.account.findUnique({
          where: { iban },
          include: { operations: true }
        });
        
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }
        
        res.json(account.operations);
      } catch (error) {
        console.error(error);
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
          reason
        } = req.body;

        if (!senderFirstName || !senderLastName || !senderIban ||
            !receiverFirstName || !receiverLastName || !receiverIban || amount === undefined) {
          return res.status(400).json({ error: 'Paramètres manquants' });
        }

        // Trouver le compte émetteur
        const senderAccount = await this.prisma.account.findUnique({
          where: { iban: senderIban }
        });

        const operation = await this.prisma.operation.create({
          data: {
            senderFirstName,
            senderLastName,
            senderIban,
            receiverFirstName,
            receiverLastName,
            receiverIban,
            amount,
            reason: reason || null,
            status: 'PENDING',
            accountId: senderAccount?.id || null
          },
          include: { account: true }
        });

        res.status(201).json(operation);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du virement' });
      }
    });

    // POST /api/operations/:id/execute - Exécute une opération en attente
    this.router.post('/:id/execute', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const operation = await this.prisma.operation.findUnique({
          where: { id }
        });

        if (!operation) {
          return res.status(404).json({ error: 'Opération non trouvée' });
        }

        if (operation.status !== 'PENDING') {
          return res.status(400).json({ error: 'L\'opération a déjà été exécutée' });
        }

        // Exécuter le virement (simplifié)
        const updatedOperation = await this.prisma.operation.update({
          where: { id },
          data: {
            status: 'EXECUTED',
            executedAt: new Date()
          },
          include: { account: true }
        });

        res.json(updatedOperation);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'exécution de l\'opération' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
