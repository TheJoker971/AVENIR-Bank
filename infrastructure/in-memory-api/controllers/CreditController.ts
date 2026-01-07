import { Router, Request, Response } from 'express';
import { CreditRepositoryInterface } from '../../../application/repositories/CreditRepositoryInterface';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { UserRepositoryInterface } from '../../../application/repositories/UserRepositoryInterface';
import { NotificationRepositoryInterface } from '../../../application/repositories/NotificationRepositoryInterface';
import { OperationRepositoryInterface } from '../../../application/repositories/OperationRepositoryInterface';
import { CreateCreditUseCase } from '../../../application/use-cases/credit/CreateCreditUseCase';
import { ProcessPaymentUseCase } from '../../../application/use-cases/credit/ProcessPaymentUseCase';
import { NotificationEntity } from '../../../domain/entities/NotificationEntity';
import { TransferData } from '../../../domain/values/TransferData';
import { OperationEntity } from '../../../domain/entities/OperationEntity';
import { requireAuth, requireRole } from '../middlewares/auth';

export class CreditController {
  private router: Router;
  private createCreditUseCase: CreateCreditUseCase;
  private processPaymentUseCase: ProcessPaymentUseCase;

  constructor(
    private creditRepository: CreditRepositoryInterface,
    private accountRepository: AccountRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private notificationRepository: NotificationRepositoryInterface,
    private operationRepository: OperationRepositoryInterface
  ) {
    this.router = Router();
    this.createCreditUseCase = new CreateCreditUseCase(creditRepository, userRepository);
    this.processPaymentUseCase = new ProcessPaymentUseCase(creditRepository);
    this.setupRoutes();
  }

  private toCreditDto(credit: any): any {
    return {
      id: credit.id,
      clientId: credit.clientId,
      principalAmount: typeof credit.principalAmount === 'number' 
        ? credit.principalAmount 
        : (credit.principalAmount?.value || 0),
      annualInterestRate: typeof credit.annualInterestRate === 'number'
        ? credit.annualInterestRate
        : (credit.annualInterestRate?.value || 0),
      insuranceRate: typeof credit.insuranceRate === 'number'
        ? credit.insuranceRate
        : (credit.insuranceRate?.value || 0),
      termMonths: credit.termMonths,
      monthlyPayment: typeof credit.monthlyPayment === 'number'
        ? credit.monthlyPayment
        : (credit.monthlyPayment?.value || 0),
      remainingBalance: typeof credit.remainingBalance === 'number'
        ? credit.remainingBalance
        : (credit.remainingBalance?.value || 0),
      status: credit.status,
      createdAt: credit.createdAt?.toISOString() || new Date().toISOString(),
      nextPaymentDate: credit.nextPaymentDate?.toISOString() || new Date().toISOString(),
    };
  }

  private setupRoutes(): void {
    // GET /api/credits - Liste tous les crédits
    this.router.get('/', requireAuth, async (req: Request, res: Response) => {
      try {
        const credits = await this.creditRepository.findAll();
        res.json(credits.map(c => this.toCreditDto(c)));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des crédits' });
      }
    });

    // GET /api/credits/:id - Récupère un crédit par ID
    this.router.get('/:id', requireAuth, async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const credit = await this.creditRepository.findById(id);
        
        if (!credit) {
          return res.status(404).json({ error: 'Crédit non trouvé' });
        }
        
        res.json(this.toCreditDto(credit));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du crédit' });
      }
    });

    // GET /api/credits/client/:clientId - Récupère les crédits d'un client
    this.router.get('/client/:clientId', requireAuth, async (req: Request, res: Response) => {
      try {
        const clientId = parseInt(req.params.clientId);
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        // Vérifier que l'utilisateur est soit le client, soit un conseiller
        if (userRole !== 'ADVISE' && userId !== clientId) {
          return res.status(403).json({ error: 'Accès interdit' });
        }

        const credits = await this.creditRepository.findByClientId(clientId);
        res.json(credits.map(c => this.toCreditDto(c)));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des crédits du client' });
      }
    });

    // POST /api/credits - Créer un nouveau crédit (conseiller uniquement)
    this.router.post('/', requireAuth, requireRole('ADVISE'), async (req: Request, res: Response) => {
      try {
        const { clientId, principalAmount, annualInterestRate, insuranceRate, termMonths } = req.body;

        // Validation des paramètres
        if (!clientId || !principalAmount || annualInterestRate === undefined || insuranceRate === undefined || !termMonths) {
          return res.status(400).json({
            error: 'Paramètres manquants',
            message: 'Les champs clientId, principalAmount, annualInterestRate, insuranceRate et termMonths sont requis'
          });
        }

        // Créer le crédit
        const credit = await this.createCreditUseCase.execute(
          parseInt(clientId),
          parseFloat(principalAmount),
          parseFloat(annualInterestRate),
          parseFloat(insuranceRate),
          parseInt(termMonths)
        );

        if (credit instanceof Error) {
          return res.status(400).json({ error: credit.message });
        }

        // Créer une notification pour le client
        try {
          const client = await this.userRepository.findById(parseInt(clientId));
          if (client && !(client instanceof Error)) {
            const notificationId = Date.now();
            const notification = NotificationEntity.create(
              notificationId,
              parseInt(clientId),
              client.email,
              'CREDIT_GRANTED',
              `Un crédit de ${principalAmount}€ vous a été accordé`,
              {
                creditId: credit.id,
                amount: principalAmount,
                monthlyPayment: credit.getMonthlyPayment().value
              }
            );
            await this.notificationRepository.save(notification);
          }
        } catch (notifError) {
          console.error('Erreur lors de la création de la notification:', notifError);
          // Ne pas faire échouer la création du crédit si la notification échoue
        }

        res.status(201).json(this.toCreditDto(credit));
      } catch (error: any) {
        console.error('Erreur lors de la création du crédit:', error);
        res.status(500).json({
          error: 'Erreur lors de la création du crédit',
          details: error.message
        });
      }
    });

    // PUT /api/credits/:id/payment - Traiter un paiement de crédit
    this.router.put('/:id/payment', requireAuth, requireRole('ADVISE'), async (req: Request, res: Response) => {
      try {
        const creditId = parseInt(req.params.id);
        const { accountId } = req.body;

        if (!accountId) {
          return res.status(400).json({
            error: 'Paramètre manquant',
            message: 'Le champ accountId est requis'
          });
        }

        // Récupérer le crédit
        const credit = await this.creditRepository.findById(creditId);
        if (!credit) {
          return res.status(404).json({ error: 'Crédit non trouvé' });
        }

        // Récupérer le compte
        const account = await this.accountRepository.findById(parseInt(accountId));
        if (!account) {
          return res.status(404).json({ error: 'Compte non trouvé' });
        }

        // Vérifier que le compte appartient au client du crédit
        if (account.getOwnerId() !== credit.getClientId()) {
          return res.status(403).json({ error: 'Ce compte n\'appartient pas au client du crédit' });
        }

        const monthlyPayment = credit.getMonthlyPayment();

        // Vérifier le solde
        if (account.getBalance().isLessThan(monthlyPayment)) {
          return res.status(400).json({
            error: 'Solde insuffisant',
            message: `Le compte ne dispose pas de fonds suffisants. Requis: ${monthlyPayment.value}€, Disponible: ${account.getBalance().value}€`
          });
        }

        // Débiter le compte
        const debitedAccount = account.debit(monthlyPayment);
        if (debitedAccount instanceof Error) {
          return res.status(400).json({ error: debitedAccount.message });
        }
        await this.accountRepository.update(debitedAccount);

        // Traiter le paiement du crédit
        const updatedCredit = await this.processPaymentUseCase.execute(creditId, monthlyPayment.value);
        if (updatedCredit instanceof Error) {
          // Annuler le débit si le paiement échoue
          await this.accountRepository.update(account);
          return res.status(400).json({ error: updatedCredit.message });
        }

        // Créer une opération bancaire
        try {
          const client = await this.userRepository.findById(credit.getClientId());
          if (client && !(client instanceof Error)) {
            const transferDataOrError = TransferData.create(
              client.lastname,
              client.firstname,
              account.getIban(),
              'AVENIR Bank',
              'Crédit',
              account.getIban(),
              true,
              `Paiement mensualité crédit #${creditId}`
            );

            if (!(transferDataOrError instanceof Error)) {
              const operationId = Date.now();
              const operationOrError = OperationEntity.create(
                operationId,
                transferDataOrError,
                monthlyPayment,
                'COMPLETED'
              );

              if (!(operationOrError instanceof Error)) {
                const completedOp = operationOrError.complete();
                await this.operationRepository.save(completedOp);
              }
            }

            // Créer une notification
            const notificationId = Date.now() + 1;
            const notification = NotificationEntity.create(
              notificationId,
              credit.getClientId(),
              client.email,
              'CREDIT_PAYMENT',
              `Paiement de ${monthlyPayment.value}€ effectué pour votre crédit`,
              {
                creditId: credit.id,
                paymentAmount: monthlyPayment.value,
                remainingBalance: updatedCredit.getRemainingBalance().value
              }
            );
            await this.notificationRepository.save(notification);
          }
        } catch (opError) {
          console.error('Erreur lors de la création de l\'opération/notification:', opError);
          // Ne pas faire échouer le paiement si l'opération échoue
        }

        res.json(this.toCreditDto(updatedCredit));
      } catch (error: any) {
        console.error('Erreur lors du traitement du paiement:', error);
        res.status(500).json({
          error: 'Erreur lors du traitement du paiement',
          details: error.message
        });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
