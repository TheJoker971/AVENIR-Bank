import { BankingService } from "../services/BankingService";
import { ApiResponse, ApiResponseBuilder } from "../types/ApiResponse";
import { 
  CreateAccountRequest,
  CreateSavingsAccountRequest,
  CreateTransferRequest,
  CreateOrderRequest,
  CreateCreditRequest,
  ProcessPaymentRequest,
  SendMessageRequest,
  UpdateInterestRateRequest,
  LoginRequest,
  RegisterRequest
} from "../types/RequestTypes";

export class BankingController {
  constructor(private bankingService: BankingService) {}

  // === AUTHENTICATION ===
  async login(request: LoginRequest): Promise<ApiResponse> {
    try {
      const user = await this.bankingService.userRepository.findByEmail(request.email);
      if (!user) {
        return ApiResponseBuilder.error("Utilisateur non trouvé");
      }
      // Ici on devrait vérifier le mot de passe (hashé)
      return ApiResponseBuilder.success({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email.value,
        role: user.role.value
      }, "Connexion réussie");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur de connexion: ${error}`);
    }
  }

  async register(request: RegisterRequest): Promise<ApiResponse> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.bankingService.userRepository.findByEmail(request.email);
      if (existingUser) {
        return ApiResponseBuilder.error("Un utilisateur avec cet email existe déjà");
      }

      // Créer l'utilisateur selon son rôle
      let user;
      switch (request.role) {
        case "CLIENT":
          user = this.bankingService.userRepository.constructor.createClient(
            Date.now(), // ID temporaire
            request.firstname,
            request.lastname,
            request.email,
            request.password,
            request.address
          );
          break;
        case "ADVISE":
          user = this.bankingService.userRepository.constructor.createAdvise(
            Date.now(),
            request.firstname,
            request.lastname,
            request.email,
            request.password,
            request.address
          );
          break;
        case "DIRECTOR":
          user = this.bankingService.userRepository.constructor.createDirector(
            Date.now(),
            request.firstname,
            request.lastname,
            request.email,
            request.password,
            request.address
          );
          break;
        default:
          return ApiResponseBuilder.error("Rôle invalide");
      }

      if (user instanceof Error) {
        return ApiResponseBuilder.error(`Erreur de création: ${user.message}`);
      }

      await this.bankingService.userRepository.save(user);
      return ApiResponseBuilder.success({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email.value,
        role: user.role.value
      }, "Inscription réussie");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur d'inscription: ${error}`);
    }
  }

  // === ACCOUNTS ===
  async createAccount(request: CreateAccountRequest): Promise<ApiResponse> {
    try {
      const account = await this.bankingService.createAccountUseCase.execute(
        request.ownerId,
        request.countryCode,
        request.bankCode,
        request.branchCode,
        request.ribKey
      );

      if (account instanceof Error) {
        return ApiResponseBuilder.error(`Erreur de création de compte: ${account.message}`);
      }

      return ApiResponseBuilder.success({
        id: account.id,
        iban: account.iban.value,
        balance: account.balance.value,
        ownerId: account.ownerId
      }, "Compte créé avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  async createSavingsAccount(request: CreateSavingsAccountRequest): Promise<ApiResponse> {
    try {
      const savingsAccount = await this.bankingService.createSavingsAccountUseCase.execute(
        request.ownerId,
        request.initialAmount,
        request.countryCode,
        request.bankCode,
        request.branchCode,
        request.ribKey
      );

      if (savingsAccount instanceof Error) {
        return ApiResponseBuilder.error(`Erreur de création de livret A: ${savingsAccount.message}`);
      }

      return ApiResponseBuilder.success({
        id: savingsAccount.id,
        iban: savingsAccount.iban.value,
        balance: savingsAccount.balance.value,
        interestRate: savingsAccount.interestRate.value,
        ownerId: savingsAccount.ownerId
      }, "Livret A créé avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  // === TRANSFERS ===
  async createTransfer(request: CreateTransferRequest): Promise<ApiResponse> {
    try {
      const operation = await this.bankingService.createTransferUseCase.execute(
        request.senderFirstName,
        request.senderLastName,
        request.senderIban,
        request.receiverFirstName,
        request.receiverLastName,
        request.receiverIban,
        request.amount,
        request.reason,
        request.instantTransfer
      );

      if (operation instanceof Error) {
        return ApiResponseBuilder.error(`Erreur de création de virement: ${operation.message}`);
      }

      return ApiResponseBuilder.success({
        id: operation.getId(),
        amount: operation.getAmount().value,
        status: operation.getStatus(),
        senderIban: operation.getSenderIban(),
        receiverIban: operation.getReceiverIban(),
        isInstant: operation.isInstantTransfer()
      }, "Virement créé avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  async executeTransfer(operationId: number): Promise<ApiResponse> {
    try {
      const operation = await this.bankingService.executeTransferUseCase.execute(operationId);

      if (operation instanceof Error) {
        return ApiResponseBuilder.error(`Erreur d'exécution: ${operation.message}`);
      }

      return ApiResponseBuilder.success({
        id: operation.getId(),
        status: operation.getStatus(),
        completedAt: operation.getCompletedAt(),
        duration: operation.getDuration()
      }, "Virement exécuté avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  // === INVESTMENTS ===
  async createOrder(request: CreateOrderRequest): Promise<ApiResponse> {
    try {
      const order = await this.bankingService.createOrderUseCase.execute(
        request.clientId,
        request.stockSymbol,
        request.orderType,
        request.quantity,
        request.price
      );

      if (order instanceof Error) {
        return ApiResponseBuilder.error(`Erreur de création d'ordre: ${order.message}`);
      }

      return ApiResponseBuilder.success({
        id: order.getId(),
        stockSymbol: order.getStockSymbol().value,
        orderType: order.getOrderType().value,
        quantity: order.getQuantity(),
        price: order.getPrice().value,
        totalAmount: order.getTotalAmount().value,
        fees: order.calculateFees().value,
        status: order.getStatus().value
      }, "Ordre créé avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  async executeOrder(orderId: number): Promise<ApiResponse> {
    try {
      const order = await this.bankingService.executeOrderUseCase.execute(orderId);

      if (order instanceof Error) {
        return ApiResponseBuilder.error(`Erreur d'exécution: ${order.message}`);
      }

      return ApiResponseBuilder.success({
        id: order.getId(),
        status: order.getStatus().value,
        executedAt: new Date()
      }, "Ordre exécuté avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  // === CREDITS ===
  async createCredit(request: CreateCreditRequest): Promise<ApiResponse> {
    try {
      const credit = await this.bankingService.createCreditUseCase.execute(
        request.clientId,
        request.principalAmount,
        request.annualInterestRate,
        request.insuranceRate,
        request.termMonths
      );

      if (credit instanceof Error) {
        return ApiResponseBuilder.error(`Erreur de création de crédit: ${credit.message}`);
      }

      return ApiResponseBuilder.success({
        id: credit.getId(),
        clientId: credit.getClientId(),
        principalAmount: credit.getPrincipalAmount().value,
        monthlyPayment: credit.getMonthlyPayment().value,
        remainingBalance: credit.getRemainingBalance().value,
        status: credit.getStatus()
      }, "Crédit créé avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  async processPayment(request: ProcessPaymentRequest): Promise<ApiResponse> {
    try {
      const credit = await this.bankingService.processPaymentUseCase.execute(
        request.creditId,
        request.paymentAmount
      );

      if (credit instanceof Error) {
        return ApiResponseBuilder.error(`Erreur de paiement: ${credit.message}`);
      }

      return ApiResponseBuilder.success({
        id: credit.getId(),
        remainingBalance: credit.getRemainingBalance().value,
        remainingPayments: credit.getRemainingPayments(),
        status: credit.getStatus()
      }, "Paiement traité avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  // === MESSAGING ===
  async sendMessage(request: SendMessageRequest): Promise<ApiResponse> {
    try {
      const message = await this.bankingService.sendMessageUseCase.execute(
        request.senderId,
        request.receiverId,
        request.subject,
        request.message
      );

      if (message instanceof Error) {
        return ApiResponseBuilder.error(`Erreur d'envoi: ${message.message}`);
      }

      return ApiResponseBuilder.success({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        subject: message.subject,
        date: message.date
      }, "Message envoyé avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  // === ADMIN ===
  async updateInterestRate(request: UpdateInterestRateRequest): Promise<ApiResponse> {
    try {
      const bank = await this.bankingService.updateInterestRateUseCase.execute(request.newRate);

      if (bank instanceof Error) {
        return ApiResponseBuilder.error(`Erreur de mise à jour: ${bank.message}`);
      }

      return ApiResponseBuilder.success({
        interestRate: bank.interestRate.value,
        updatedAt: new Date()
      }, "Taux d'intérêt mis à jour avec succès");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }

  async calculateDailyInterest(): Promise<ApiResponse> {
    try {
      await this.bankingService.calculateDailyInterestUseCase.execute();
      return ApiResponseBuilder.success(null, "Calcul des intérêts quotidiens effectué");
    } catch (error) {
      return ApiResponseBuilder.error(`Erreur: ${error}`);
    }
  }
}
