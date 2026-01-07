import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { StockHoldingRepositoryInterface } from "application/repositories/StockHoldingRepositoryInterface";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";
import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { UpdateStockHoldingUseCase } from "./UpdateStockHoldingUseCase";
import { CalculateEquilibriumPriceUseCase } from "./CalculateEquilibriumPriceUseCase";
import { StockSymbol } from "domain/values/StockSymbol";
import { Amount } from "domain/values/Amount";
import { TransferData } from "domain/values/TransferData";
import { OperationEntity } from "domain/entities/OperationEntity";
import { NotificationEntity } from "domain/entities/NotificationEntity";

/**
 * Use case pour exécuter immédiatement un achat/vente au prix du marché
 * (sans créer d'ordre en attente)
 */
export class ExecuteInstantTradeUseCase {
  private updateStockHoldingUseCase: UpdateStockHoldingUseCase;
  private calculateEquilibriumPriceUseCase: CalculateEquilibriumPriceUseCase;

  constructor(
    private stockRepository: StockRepositoryInterface,
    private accountRepository: AccountRepositoryInterface,
    private stockHoldingRepository: StockHoldingRepositoryInterface,
    private operationRepository: OperationRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private notificationRepository: NotificationRepositoryInterface,
    private orderRepository: OrderRepositoryInterface
  ) {
    this.updateStockHoldingUseCase = new UpdateStockHoldingUseCase(stockHoldingRepository);
    this.calculateEquilibriumPriceUseCase = new CalculateEquilibriumPriceUseCase(
      orderRepository,
      stockRepository
    );
  }

  async executeBuy(
    clientId: number,
    stockSymbol: StockSymbol,
    quantity: number
  ): Promise<{ success: true; message: string } | Error> {
    // 1. Récupérer l'action
    const stock = await this.stockRepository.findBySymbol(stockSymbol);
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // 2. Vérifier la disponibilité
    if (quantity > stock.getAvailableShares()) {
      return new Error(`Quantité insuffisante. Disponible: ${stock.getAvailableShares()}, Demandé: ${quantity}`);
    }

    const currentPrice = stock.getCurrentPrice();
    const totalAmount = currentPrice.multiply(quantity);
    const fees = Amount.create(1);
    if (fees instanceof Error) return fees;
    const totalWithFees = totalAmount.add(fees);

    // 3. Récupérer les comptes du client
    const accounts = await this.accountRepository.findByOwnerId(clientId);
    if (accounts.length === 0) {
      return new Error("Le client n'a pas de compte bancaire");
    }

    const account = accounts[0];

    // 4. Vérifier le solde (pour les achats au prix du marché)
    const accountBalance = account.getBalance();
    if (accountBalance.isLessThan(totalWithFees)) {
      return new Error(`Solde insuffisant. Requis: ${totalWithFees.value}€, Disponible: ${accountBalance.value}€`);
    }

    // 5. Débiter le compte
    const debitedAccount = account.debit(totalWithFees);
    if (debitedAccount instanceof Error) {
      return debitedAccount;
    }
    await this.accountRepository.update(debitedAccount);

    // 6. Réduire les actions disponibles
    const updatedStock = stock.executeBuyOrder(quantity);
    if (updatedStock instanceof Error) {
      return updatedStock;
    }
    await this.stockRepository.update(updatedStock);

    // 6b. Recalculer le prix d'équilibre après l'achat
    try {
      const equilibriumPrice = await this.calculateEquilibriumPriceUseCase.execute(stockSymbol);
      if (!(equilibriumPrice instanceof Error)) {
        const stockWithNewPrice = updatedStock.updatePrice(equilibriumPrice);
        await this.stockRepository.update(stockWithNewPrice);
        console.log(`📊 [ExecuteInstantTradeUseCase] Prix mis à jour après achat: ${equilibriumPrice.value}€`);
      }
    } catch (error) {
      console.error('Erreur lors du calcul du prix d\'équilibre:', error);
      // Ne pas faire échouer la transaction si le calcul échoue
    }

    // 7. Ajouter les actions au portfolio du client
    const holdingResult = await this.updateStockHoldingUseCase.addShares(
      clientId,
      stockSymbol,
      quantity,
      currentPrice
    );

    if (holdingResult instanceof Error) {
      return holdingResult;
    }

    // 8. Créer une opération bancaire
    const user = await this.userRepository.findById(clientId);
    if (user && !(user instanceof Error)) {
      try {
        const transferDataOrError = TransferData.create(
          user.lastname,
          user.firstname,
          account.iban.value,
          'AVENIR Bank',
          'Marché',
          'FR7630001007941234567890185',
          true,
          `Achat immédiat de ${quantity} ${stockSymbol.value} @ ${currentPrice.value}€`
        );

        if (!(transferDataOrError instanceof Error)) {
          const operationId = Date.now();
          const operationOrError = OperationEntity.create(
            operationId,
            transferDataOrError,
            totalWithFees,
            "COMPLETED"
          );

          if (!(operationOrError instanceof Error)) {
            const completedOp = operationOrError.complete();
            await this.operationRepository.save(completedOp);
          }
        }

        // 9. Créer une notification
        const notificationId = Date.now() + 1;
        const notification = NotificationEntity.createTransactionCompletedNotification(
          notificationId,
          user.id,
          user.email,
          `Achat de ${quantity} ${stock.getName()}`,
          totalWithFees.value,
          account.iban.value
        );
        await this.notificationRepository.save(notification);
      } catch (error) {
        console.error('Erreur lors de la création de l\'opération/notification:', error);
      }
    }

    return {
      success: true,
      message: `Achat immédiat de ${quantity} ${stockSymbol.value} réussi au prix de ${currentPrice.value}€/action`
    };
  }

  async executeSell(
    clientId: number,
    stockSymbol: StockSymbol,
    quantity: number
  ): Promise<{ success: true; message: string } | Error> {
    // 1. Récupérer l'action
    const stock = await this.stockRepository.findBySymbol(stockSymbol);
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // 2. Vérifier que le client possède les actions
    const holding = await this.stockHoldingRepository.findByClientIdAndSymbol(
      clientId,
      stockSymbol
    );

    if (!holding || holding.getQuantity() < quantity) {
      return new Error(`Quantité insuffisante. Vous possédez ${holding?.getQuantity() || 0} action(s), vous essayez d'en vendre ${quantity}`);
    }

    const currentPrice = stock.getCurrentPrice();
    const totalAmount = currentPrice.multiply(quantity);
    const fees = Amount.create(1);
    if (fees instanceof Error) return fees;
    const totalAfterFees = totalAmount.subtract(fees);

    // 3. Récupérer le compte du client
    const accounts = await this.accountRepository.findByOwnerId(clientId);
    if (accounts.length === 0) {
      return new Error("Le client n'a pas de compte bancaire");
    }

    const account = accounts[0];

    // 4. Créditer le compte
    const creditedAccount = account.credit(totalAfterFees);
    if (creditedAccount instanceof Error) {
      return creditedAccount;
    }
    await this.accountRepository.update(creditedAccount);

    // 5. Augmenter les actions disponibles
    const updatedStock = stock.executeSellOrder(quantity);
    if (updatedStock instanceof Error) {
      return updatedStock;
    }
    await this.stockRepository.update(updatedStock);

    // 5b. Recalculer le prix d'équilibre après la vente
    try {
      const equilibriumPrice = await this.calculateEquilibriumPriceUseCase.execute(stockSymbol);
      if (!(equilibriumPrice instanceof Error)) {
        const stockWithNewPrice = updatedStock.updatePrice(equilibriumPrice);
        await this.stockRepository.update(stockWithNewPrice);
        console.log(`📊 [ExecuteInstantTradeUseCase] Prix mis à jour après vente: ${equilibriumPrice.value}€`);
      }
    } catch (error) {
      console.error('Erreur lors du calcul du prix d\'équilibre:', error);
      // Ne pas faire échouer la transaction si le calcul échoue
    }

    // 6. Retirer les actions du portfolio du client
    const holdingResult = await this.updateStockHoldingUseCase.removeShares(
      clientId,
      stockSymbol,
      quantity
    );

    if (holdingResult instanceof Error) {
      return holdingResult;
    }

    // 7. Créer une opération bancaire
    const user = await this.userRepository.findById(clientId);
    if (user && !(user instanceof Error)) {
      try {
        const transferDataOrError = TransferData.create(
          'AVENIR Bank',
          'Marché',
          'FR7630001007941234567890185',
          user.lastname,
          user.firstname,
          account.iban.value,
          true,
          `Vente immédiate de ${quantity} ${stockSymbol.value} @ ${currentPrice.value}€`
        );

        if (!(transferDataOrError instanceof Error)) {
          const operationId = Date.now();
          const operationOrError = OperationEntity.create(
            operationId,
            transferDataOrError,
            totalAfterFees,
            "COMPLETED"
          );

          if (!(operationOrError instanceof Error)) {
            const completedOp = operationOrError.complete();
            await this.operationRepository.save(completedOp);
          }
        }

        // 8. Créer une notification
        const notificationId = Date.now() + 1;
        const notification = NotificationEntity.createTransactionCompletedNotification(
          notificationId,
          user.id,
          user.email,
          `Vente de ${quantity} ${stock.getName()}`,
          totalAfterFees.value,
          account.iban.value
        );
        await this.notificationRepository.save(notification);
      } catch (error) {
        console.error('Erreur lors de la création de l\'opération/notification:', error);
      }
    }

    return {
      success: true,
      message: `Vente immédiate de ${quantity} ${stockSymbol.value} réussie au prix de ${currentPrice.value}€/action`
    };
  }
}

