import { OrderEntity } from "domain/entities/OrderEntity";
import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { StockHoldingRepositoryInterface } from "application/repositories/StockHoldingRepositoryInterface";
import { MatchOrdersUseCase } from "./MatchOrdersUseCase";
import { ExecuteMatchedOrdersUseCase } from "./ExecuteMatchedOrdersUseCase";
import { ExecuteInstantTradeUseCase } from "./ExecuteInstantTradeUseCase";
import { StockSymbol } from "domain/values/StockSymbol";
import { Amount } from "domain/values/Amount";
import { TransferData } from "domain/values/TransferData";
import { OperationEntity } from "domain/entities/OperationEntity";

export class CreateOrderUseCase {
  private matchOrdersUseCase: MatchOrdersUseCase;
  private executeMatchedOrdersUseCase: ExecuteMatchedOrdersUseCase;
  private executeInstantTradeUseCase: ExecuteInstantTradeUseCase;

  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private accountRepository: AccountRepositoryInterface,
    private stockHoldingRepository: StockHoldingRepositoryInterface,
    private operationRepository: any, // OperationRepositoryInterface
    private notificationRepository: any // NotificationRepositoryInterface
  ) {
    this.matchOrdersUseCase = new MatchOrdersUseCase(orderRepository, stockRepository);
    this.executeMatchedOrdersUseCase = new ExecuteMatchedOrdersUseCase(
      orderRepository,
      stockRepository,
      accountRepository,
      stockHoldingRepository,
      operationRepository,
      userRepository,
      notificationRepository
    );
    this.executeInstantTradeUseCase = new ExecuteInstantTradeUseCase(
      stockRepository,
      accountRepository,
      stockHoldingRepository,
      operationRepository,
      userRepository,
      notificationRepository,
      orderRepository
    );
  }

  async execute(
    clientId: number,
    stockSymbol: string,
    orderType: "BUY" | "SELL",
    quantity: number,
    price: number | null  // null = prix du marché
  ): Promise<OrderEntity | Error> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(clientId);
    if (!user || user instanceof Error) {
      return new Error("Utilisateur non trouvé");
    }

    // Vérifier que l'action existe
    const stockSymbolOrError = StockSymbol.create(stockSymbol);
    if (stockSymbolOrError instanceof Error) return stockSymbolOrError;

    const stock = await this.stockRepository.findBySymbol(stockSymbolOrError);
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // ===== NOUVEAU : Achat/Vente immédiat au prix du marché =====
    if (price === null) {
      console.log(`🔥 [CreateOrderUseCase] Exécution immédiate au prix du marché: ${orderType} ${quantity} ${stockSymbol}`);
      
      if (orderType === "BUY") {
        const result = await this.executeInstantTradeUseCase.executeBuy(
          clientId,
          stockSymbolOrError,
          quantity
        );
        
        if (result instanceof Error) {
          return result;
        }
        
        // Retourner un ordre fictif "EXECUTED" pour compatibilité avec l'API
        const executedOrder = OrderEntity.createBuyOrder(
          Date.now(),
          stockSymbolOrError,
          quantity,
          stock.getCurrentPrice(),
          clientId
        );
        
        if (executedOrder instanceof Error) return executedOrder;
        return executedOrder.execute();
        
      } else {
        const result = await this.executeInstantTradeUseCase.executeSell(
          clientId,
          stockSymbolOrError,
          quantity
        );
        
        if (result instanceof Error) {
          return result;
        }
        
        // Retourner un ordre fictif "EXECUTED" pour compatibilité avec l'API
        const executedOrder = OrderEntity.createSellOrder(
          Date.now(),
          stockSymbolOrError,
          quantity,
          stock.getCurrentPrice(),
          clientId
        );
        
        if (executedOrder instanceof Error) return executedOrder;
        return executedOrder.execute();
      }
    }
    
    // ===== Sinon, créer un ordre en attente (ancien comportement) =====

    // Créer les objets de valeur
    let finalPrice: Amount;
    const amountOrError = Amount.create(price);
    if (amountOrError instanceof Error) return amountOrError;
    finalPrice = amountOrError;

    // Vérifier les conditions spécifiques selon le type d'ordre
    if (orderType === "BUY") {
      // Vérifier que le client a assez d'argent
      const accounts = await this.accountRepository.findByOwnerId(clientId);
      if (accounts.length === 0) {
        return new Error("Le client n'a pas de compte bancaire");
      }

      // Calculer le montant total avec frais
      const totalAmount = finalPrice.multiply(quantity);
      const fees = Amount.create(1);
      if (fees instanceof Error) return fees;
      const totalWithFees = totalAmount.add(fees);

      // Vérifier le solde total des comptes
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.getBalance().value, 0);
      if (totalBalance < totalWithFees.value) {
        return new Error(`Solde insuffisant. Montant requis: ${totalWithFees.value.toFixed(2)}€, Solde disponible: ${totalBalance.toFixed(2)}€`);
      }

      // NOUVEAU : Pour les ordres BUY, réserver les fonds immédiatement
      // Trouver le compte avec le plus de solde
      const accountWithFunds = accounts.reduce((max, acc) => 
        acc.getBalance().value > max.getBalance().value ? acc : max
      );

      // Débiter le compte pour réserver les fonds
      const debitedAccount = accountWithFunds.debit(totalWithFees);
      if (debitedAccount instanceof Error) {
        return debitedAccount;
      }

      // Mettre à jour le compte dans le repository
      await this.accountRepository.update(debitedAccount);
      
      // Créer une opération pour tracer la réservation
      try {
        const transferDataOrError = TransferData.create(
          'AVENIR Bank',
          'Système',
          'FR7630001007941234567890185',
          user.lastname,
          user.firstname,
          accountWithFunds.iban.value,
          true,
          `Réservation pour ordre d'achat ${stockSymbol} (${quantity} actions)`
        );

        if (!(transferDataOrError instanceof Error)) {
          const operationId = Date.now();
          const operationOrError = OperationEntity.create(
            operationId,
            transferDataOrError,
            totalWithFees,
            "PENDING"
          );

          if (!(operationOrError instanceof Error)) {
            await this.operationRepository.save(operationOrError);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'opération de réservation:', error);
      }
    } else {
      // Vérifier que le client possède assez d'actions
      const holding = await this.stockHoldingRepository.findByClientIdAndSymbol(
        clientId,
        stockSymbolOrError
      );

      if (!holding || holding.getQuantity() < quantity) {
        return new Error(`Quantité insuffisante. Vous possédez ${holding?.getQuantity() || 0} action(s), vous essayez d'en vendre ${quantity}`);
      }
    }

    // Créer l'ordre
    let order: OrderEntity | Error;
    if (orderType === "BUY") {
      order = OrderEntity.createBuyOrder(
        Date.now(), // ID temporaire
        stockSymbolOrError,
        quantity,
        finalPrice,
        clientId
      );
    } else {
      order = OrderEntity.createSellOrder(
        Date.now(), // ID temporaire
        stockSymbolOrError,
        quantity,
        finalPrice,
        clientId
      );
    }

    if (order instanceof Error) {
      return order;
    }

    // Sauvegarder l'ordre
    await this.orderRepository.save(order);

    // Déclencher le matching automatique après création de l'ordre
    try {
      const matches = await this.matchOrdersUseCase.findMatches(stockSymbolOrError);
      if (matches.length > 0) {
        // Exécuter les matches trouvés
        await this.executeMatchedOrdersUseCase.executeMatchesForStock(matches);
      }
    } catch (error) {
      // Ne pas faire échouer la création de l'ordre si le matching échoue
      // L'ordre restera en attente et pourra être matché plus tard
      console.error("Erreur lors du matching automatique:", error);
    }

    return order;
  }
}
