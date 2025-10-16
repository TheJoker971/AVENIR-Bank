import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { BankRepositoryInterface } from "application/repositories/BankRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { SavingsAccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { CreditRepositoryInterface } from "application/repositories/CreditRepositoryInterface";
import { MessageRepositoryInterface } from "application/repositories/MessageRepositoryInterface";
import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";

// Import des use cases
import { CreateAccountUseCase } from "application/use-cases/account/CreateAccountUseCase";
import { CreateSavingsAccountUseCase } from "application/use-cases/savings/CreateSavingsAccountUseCase";
import { CalculateDailyInterestUseCase } from "application/use-cases/savings/CalculateDailyInterestUseCase";
import { CreateOrderUseCase } from "application/use-cases/investment/CreateOrderUseCase";
import { ExecuteOrderUseCase } from "application/use-cases/investment/ExecuteOrderUseCase";
import { CreateCreditUseCase } from "application/use-cases/credit/CreateCreditUseCase";
import { ProcessPaymentUseCase } from "application/use-cases/credit/ProcessPaymentUseCase";
import { CreateTransferUseCase } from "application/use-cases/operation/CreateTransferUseCase";
import { ExecuteTransferUseCase } from "application/use-cases/operation/ExecuteTransferUseCase";
import { SendMessageUseCase } from "application/use-cases/messaging/SendMessageUseCase";
import { AssignMessageToAdvisorUseCase } from "application/use-cases/messaging/AssignMessageToAdvisorUseCase";
import { UpdateInterestRateUseCase } from "application/use-cases/admin/UpdateInterestRateUseCase";

export class BankingService {
  // Repositories
  public readonly userRepository: UserRepositoryInterface;
  public readonly bankRepository: BankRepositoryInterface;
  public readonly accountRepository: AccountRepositoryInterface;
  public readonly savingsAccountRepository: SavingsAccountRepositoryInterface;
  public readonly operationRepository: OperationRepositoryInterface;
  public readonly orderRepository: OrderRepositoryInterface;
  public readonly stockRepository: StockRepositoryInterface;
  public readonly creditRepository: CreditRepositoryInterface;
  public readonly messageRepository: MessageRepositoryInterface;
  public readonly notificationRepository: NotificationRepositoryInterface;

  // Use Cases
  public readonly createAccountUseCase: CreateAccountUseCase;
  public readonly createSavingsAccountUseCase: CreateSavingsAccountUseCase;
  public readonly calculateDailyInterestUseCase: CalculateDailyInterestUseCase;
  public readonly createOrderUseCase: CreateOrderUseCase;
  public readonly executeOrderUseCase: ExecuteOrderUseCase;
  public readonly createCreditUseCase: CreateCreditUseCase;
  public readonly processPaymentUseCase: ProcessPaymentUseCase;
  public readonly createTransferUseCase: CreateTransferUseCase;
  public readonly executeTransferUseCase: ExecuteTransferUseCase;
  public readonly sendMessageUseCase: SendMessageUseCase;
  public readonly assignMessageToAdvisorUseCase: AssignMessageToAdvisorUseCase;
  public readonly updateInterestRateUseCase: UpdateInterestRateUseCase;

  constructor(
    userRepository: UserRepositoryInterface,
    bankRepository: BankRepositoryInterface,
    accountRepository: AccountRepositoryInterface,
    savingsAccountRepository: SavingsAccountRepositoryInterface,
    operationRepository: OperationRepositoryInterface,
    orderRepository: OrderRepositoryInterface,
    stockRepository: StockRepositoryInterface,
    creditRepository: CreditRepositoryInterface,
    messageRepository: MessageRepositoryInterface,
    notificationRepository: NotificationRepositoryInterface
  ) {
    // Repositories
    this.userRepository = userRepository;
    this.bankRepository = bankRepository;
    this.accountRepository = accountRepository;
    this.savingsAccountRepository = savingsAccountRepository;
    this.operationRepository = operationRepository;
    this.orderRepository = orderRepository;
    this.stockRepository = stockRepository;
    this.creditRepository = creditRepository;
    this.messageRepository = messageRepository;
    this.notificationRepository = notificationRepository;

    // Use Cases
    this.createAccountUseCase = new CreateAccountUseCase(
      this.accountRepository,
      this.userRepository
    );

    this.createSavingsAccountUseCase = new CreateSavingsAccountUseCase(
      this.savingsAccountRepository,
      this.userRepository,
      this.bankRepository
    );

    this.calculateDailyInterestUseCase = new CalculateDailyInterestUseCase(
      this.savingsAccountRepository,
      this.notificationRepository,
      this.userRepository
    );

    this.createOrderUseCase = new CreateOrderUseCase(
      this.orderRepository,
      this.stockRepository,
      this.userRepository
    );

    this.executeOrderUseCase = new ExecuteOrderUseCase(
      this.orderRepository,
      this.stockRepository,
      this.accountRepository
    );

    this.createCreditUseCase = new CreateCreditUseCase(
      this.creditRepository,
      this.userRepository
    );

    this.processPaymentUseCase = new ProcessPaymentUseCase(
      this.creditRepository
    );

    this.createTransferUseCase = new CreateTransferUseCase(
      this.operationRepository,
      this.accountRepository
    );

    this.executeTransferUseCase = new ExecuteTransferUseCase(
      this.operationRepository,
      this.accountRepository
    );

    this.sendMessageUseCase = new SendMessageUseCase(
      this.messageRepository,
      this.userRepository
    );

    this.assignMessageToAdvisorUseCase = new AssignMessageToAdvisorUseCase(
      this.messageRepository,
      this.userRepository
    );

    this.updateInterestRateUseCase = new UpdateInterestRateUseCase(
      this.bankRepository,
      this.savingsAccountRepository,
      this.notificationRepository,
      this.userRepository
    );
  }

  // Méthode pour initialiser le service avec des données de test
  async initialize(): Promise<void> {
    // Initialiser les repositories avec des données de test
    if ('seedTestData' in this.userRepository) {
      await (this.userRepository as any).seedTestData();
    }
    if ('seedTestData' in this.bankRepository) {
      await (this.bankRepository as any).seedTestData();
    }
    // Ajouter d'autres initialisations selon les besoins
  }

  // Méthode pour nettoyer les données (utile pour les tests)
  async cleanup(): Promise<void> {
    if ('clear' in this.userRepository) {
      (this.userRepository as any).clear();
    }
    if ('clear' in this.bankRepository) {
      (this.bankRepository as any).clear();
    }
    // Ajouter d'autres nettoyages selon les besoins
  }
}
