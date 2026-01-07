import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { StockHoldingRepositoryInterface } from "application/repositories/StockHoldingRepositoryInterface";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";
import { UpdateStockHoldingUseCase } from "./UpdateStockHoldingUseCase";
import { CalculateEquilibriumPriceUseCase } from "./CalculateEquilibriumPriceUseCase";
import { MatchedOrderPair } from "./MatchOrdersUseCase";
import { OrderEntity } from "domain/entities/OrderEntity";
import { StockEntity } from "domain/entities/StockEntity";
import { Amount } from "domain/values/Amount";
import { OperationEntity } from "domain/entities/OperationEntity";
import { TransferData } from "domain/values/TransferData";
import { NotificationEntity } from "domain/entities/NotificationEntity";

/**
 * Use case pour exécuter les ordres qui ont été matchés
 * Gère le débit/crédit des comptes, la mise à jour des holdings et le prix de l'action
 */
export class ExecuteMatchedOrdersUseCase {
  private updateStockHoldingUseCase: UpdateStockHoldingUseCase;
  private calculateEquilibriumPriceUseCase: CalculateEquilibriumPriceUseCase;

  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface,
    private accountRepository: AccountRepositoryInterface,
    private stockHoldingRepository: StockHoldingRepositoryInterface,
    private operationRepository: OperationRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private notificationRepository: NotificationRepositoryInterface
  ) {
    this.updateStockHoldingUseCase = new UpdateStockHoldingUseCase(stockHoldingRepository);
    this.calculateEquilibriumPriceUseCase = new CalculateEquilibriumPriceUseCase(
      orderRepository,
      stockRepository
    );
  }

  /**
   * Exécute une paire d'ordres matchés
   */
  async executeMatch(match: MatchedOrderPair): Promise<{
    executedBuyOrder: OrderEntity;
    executedSellOrder: OrderEntity;
    updatedStock: StockEntity;
  } | Error> {
    const { buyOrder, sellOrder, matchPrice, matchQuantity } = match;

    // 1. Vérifier que les ordres sont toujours en attente
    const currentBuyOrder = await this.orderRepository.findById(buyOrder.id);
    const currentSellOrder = await this.orderRepository.findById(sellOrder.id);

    if (!currentBuyOrder || !currentSellOrder) {
      return new Error("Ordre non trouvé");
    }

    if (!currentBuyOrder.isPending() || !currentSellOrder.isPending()) {
      return new Error("Un des ordres n'est plus en attente");
    }

    // 2. Vérifier les soldes des comptes
    const buyOrderAccounts = await this.accountRepository.findByOwnerId(buyOrder.getClientId());
    const sellOrderAccounts = await this.accountRepository.findByOwnerId(sellOrder.getClientId());

    if (buyOrderAccounts.length === 0) {
      return new Error("Le client acheteur n'a pas de compte");
    }

    if (sellOrderAccounts.length === 0) {
      return new Error("Le client vendeur n'a pas de compte");
    }

    // Utiliser le premier compte disponible (on pourrait améliorer pour choisir le compte)
    const buyerAccount = buyOrderAccounts[0];
    const sellerAccount = sellOrderAccounts[0];

    // 3. Calculer les montants
    const transactionAmount = matchPrice.multiply(matchQuantity);
    const transactionFees = Amount.create(1); // Frais fixes de 1€
    if (transactionFees instanceof Error) {
      return transactionFees;
    }

    const totalBuyAmount = transactionAmount.add(transactionFees); // Acheteur paie le montant + frais
    const totalSellAmount = transactionAmount.subtract(transactionFees); // Vendeur reçoit le montant - frais

    // 4. Gérer le débit de l'acheteur avec système de réservation
    // Trouver l'opération de réservation pour cet ordre
    const allOperations = await this.operationRepository.findAll();
    const reservationOp = allOperations.find((op: any) => 
      op.status === 'PENDING' && 
      op.transferData?.reason?.includes(`ordre d'achat ${buyOrder.getStockSymbol().value}`)
    );

    let debitedBuyerAccount;
    if (!reservationOp) {
      // Si pas de réservation trouvée, débiter normalement (rétrocompatibilité)
      if (buyerAccount.balance.isLessThan(totalBuyAmount)) {
        return new Error("Solde insuffisant pour l'acheteur");
      }
      debitedBuyerAccount = buyerAccount.debit(totalBuyAmount);
      if (debitedBuyerAccount instanceof Error) {
        return debitedBuyerAccount;
      }
      await this.accountRepository.update(debitedBuyerAccount);
    } else {
      // Marquer la réservation comme complétée
      const completedReservation = reservationOp.complete();
      await this.operationRepository.update(completedReservation);
      
      // Calculer la différence de prix entre réservation et exécution
      const reservedAmount = reservationOp.amount;
      
      if (totalBuyAmount.value > reservedAmount.value) {
        // L'exécution coûte plus cher, débiter la différence
        const diff = Amount.create(totalBuyAmount.value - reservedAmount.value);
        if (!(diff instanceof Error)) {
          debitedBuyerAccount = buyerAccount.debit(diff);
          if (debitedBuyerAccount instanceof Error) {
            return debitedBuyerAccount;
          }
          await this.accountRepository.update(debitedBuyerAccount);
        }
      } else if (reservedAmount.value > totalBuyAmount.value) {
        // L'exécution coûte moins cher, rembourser la différence
        const diff = Amount.create(reservedAmount.value - totalBuyAmount.value);
        if (!(diff instanceof Error)) {
          const creditedBuyerAccount = buyerAccount.credit(diff);
          if (!(creditedBuyerAccount instanceof Error)) {
            await this.accountRepository.update(creditedBuyerAccount);
          }
        }
      }
      // Sinon, montants identiques, rien à faire (argent déjà réservé)
      debitedBuyerAccount = buyerAccount; // Pas de changement au compte
    }

    // 6. Créditer le compte du vendeur
    const creditedSellerAccount = sellerAccount.credit(totalSellAmount);
    if (creditedSellerAccount instanceof Error) {
      return creditedSellerAccount;
    }

    // 7. Mettre à jour le compte du vendeur dans le repository
    await this.accountRepository.update(creditedSellerAccount);

    // 8. Exécuter ou partiellement exécuter les ordres
    let executedBuyOrder: OrderEntity;
    let executedSellOrder: OrderEntity;

    if (matchQuantity === buyOrder.getQuantity()) {
      // Ordre d'achat complètement exécuté
      executedBuyOrder = buyOrder.execute();
    } else {
      // Ordre d'achat partiellement exécuté
      const partialResult = buyOrder.partiallyExecute(matchQuantity);
      if (partialResult instanceof Error) {
        return partialResult;
      }
      executedBuyOrder = partialResult;
    }

    if (matchQuantity === sellOrder.getQuantity()) {
      // Ordre de vente complètement exécuté
      executedSellOrder = sellOrder.execute();
    } else {
      // Ordre de vente partiellement exécuté
      const partialResult = sellOrder.partiallyExecute(matchQuantity);
      if (partialResult instanceof Error) {
        return partialResult;
      }
      executedSellOrder = partialResult;
    }

    // 9. Mettre à jour les ordres dans le repository
    await this.orderRepository.update(executedBuyOrder);
    await this.orderRepository.update(executedSellOrder);

    // 10. Mettre à jour les holdings d'actions
    const stock = await this.stockRepository.findBySymbol(buyOrder.getStockSymbol());
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // Ajouter les actions à l'acheteur
    await this.updateStockHoldingUseCase.addShares(
      buyOrder.getClientId(),
      buyOrder.getStockSymbol(),
      matchQuantity,
      matchPrice
    );

    // Retirer les actions du vendeur
    await this.updateStockHoldingUseCase.removeShares(
      sellOrder.getClientId(),
      sellOrder.getStockSymbol(),
      matchQuantity
    );

    // 11. Mettre à jour le prix de l'action avec le prix de match
    // Le prix de l'action est mis à jour avec le prix de la transaction (matchPrice)
    const updatedStock = stock.updatePrice(matchPrice);
    
    // Note: Dans un matching, les actions sont transférées du vendeur à l'acheteur
    // donc le nombre total d'actions disponibles ne change pas
    // On ne fait pas executeBuyOrder car cela réduirait les actions disponibles
    // qui sont déjà réduites quand le vendeur les a vendues (availableShares augmente quand on vend)
    
    await this.stockRepository.update(updatedStock);
    
    // Recalculer le prix d'équilibre basé sur le carnet d'ordres restant
    const equilibriumPrice = await this.calculateEquilibriumPriceUseCase.execute(buyOrder.getStockSymbol());
    if (!(equilibriumPrice instanceof Error)) {
      // Mettre à jour le prix de l'action
      const finalStock = updatedStock.updatePrice(equilibriumPrice);
      await this.stockRepository.update(finalStock);
      
      // Déclencher un nouveau matching avec le nouveau prix (matching récursif)
      await this.triggerRecursiveMatching(buyOrder.getStockSymbol());
    }

    // 12. Créer les opérations bancaires pour l'historique
    try {
      // Récupérer les utilisateurs pour les noms et emails
      const buyerUser = await this.userRepository.findById(buyOrder.getClientId());
      const sellerUser = await this.userRepository.findById(sellOrder.getClientId());
      
      console.log('🔍 [ExecuteMatch] Buyer User:', {
        id: buyerUser && !(buyerUser instanceof Error) ? buyerUser.id : 'N/A',
        lastname: buyerUser && !(buyerUser instanceof Error) ? buyerUser.lastname : 'N/A',
        firstname: buyerUser && !(buyerUser instanceof Error) ? buyerUser.firstname : 'N/A'
      });
      console.log('🔍 [ExecuteMatch] Seller User:', {
        id: sellerUser && !(sellerUser instanceof Error) ? sellerUser.id : 'N/A',
        lastname: sellerUser && !(sellerUser instanceof Error) ? sellerUser.lastname : 'N/A',
        firstname: sellerUser && !(sellerUser instanceof Error) ? sellerUser.firstname : 'N/A'
      });

      if (buyerUser && !(buyerUser instanceof Error) && sellerUser && !(sellerUser instanceof Error)) {
        // Utiliser directement les IBANs des comptes
        const buyerIban = buyerAccount.iban;
        const sellerIban = sellerAccount.iban;

        if (buyerIban && sellerIban) {
          // Créer TransferData pour la transaction d'actions
          console.log('🔍 [ExecuteMatch] Creating TransferData with:', {
            senderLastName: buyerUser.lastname,
            senderFirstName: buyerUser.firstname,
            senderIban: buyerIban.value,
            receiverLastName: sellerUser.lastname,
            receiverFirstName: sellerUser.firstname,
            receiverIban: sellerIban.value
          });
          
          const transferDataOrError = TransferData.create(
            buyerUser.lastname,
            buyerUser.firstname,
            buyerIban.value,
            sellerUser.lastname,
            sellerUser.firstname,
            sellerIban.value,
            true, // Transfer instantané
            `Transaction d'actions: ${matchQuantity} ${buyOrder.getStockSymbol().value} à ${matchPrice.value}€`
          );

          if (!(transferDataOrError instanceof Error)) {
            console.log('✅ [ExecuteMatch] TransferData created successfully');
            // Créer l'opération pour l'acheteur (débit)
            const operationId = Date.now();
            const operationOrError = OperationEntity.create(
              operationId,
              transferDataOrError,
              totalBuyAmount,
              "COMPLETED"
            );

            if (!(operationOrError instanceof Error)) {
              const completedOperation = operationOrError.complete();
              await this.operationRepository.save(completedOperation);
            }

            // Créer l'opération pour le vendeur (crédit)
            const operationId2 = Date.now() + 1;
            console.log('🔍 [ExecuteMatch] Creating reverse TransferData with:', {
              senderLastName: sellerUser.lastname,
              senderFirstName: sellerUser.firstname,
              senderIban: sellerIban.value,
              receiverLastName: buyerUser.lastname,
              receiverFirstName: buyerUser.firstname,
              receiverIban: buyerIban.value
            });
            
            const reverseTransferDataOrError = TransferData.create(
              sellerUser.lastname,
              sellerUser.firstname,
              sellerIban.value,
              buyerUser.lastname,
              buyerUser.firstname,
              buyerIban.value,
              true,
              `Transaction d'actions: Vente de ${matchQuantity} ${sellOrder.getStockSymbol().value} à ${matchPrice.value}€`
            );

            if (!(reverseTransferDataOrError instanceof Error)) {
              const operation2OrError = OperationEntity.create(
                operationId2,
                reverseTransferDataOrError,
                totalSellAmount,
                "COMPLETED"
              );

              if (!(operation2OrError instanceof Error)) {
                const completedOperation2 = operation2OrError.complete();
                await this.operationRepository.save(completedOperation2);
              }
            }
          }
        }

        // 13. Créer des notifications pour les deux clients
        const stock = await this.stockRepository.findBySymbol(buyOrder.getStockSymbol());
        const stockName = stock ? stock.getName() : buyOrder.getStockSymbol().value;

        // Notification pour l'acheteur
        const buyerNotificationId = Date.now();
        const buyerNotification = NotificationEntity.createTransactionCompletedNotification(
          buyerNotificationId,
          buyerUser.id,
          buyerUser.email,
          `Achat d'actions ${stockName}`,
          totalBuyAmount.value,
          buyerAccount.iban.value
        );
        await this.notificationRepository.save(buyerNotification);

        // Notification pour le vendeur
        const sellerNotificationId = Date.now() + 1;
        const sellerNotification = NotificationEntity.createTransactionCompletedNotification(
          sellerNotificationId,
          sellerUser.id,
          sellerUser.email,
          `Vente d'actions ${stockName}`,
          totalSellAmount.value,
          sellerAccount.iban.value
        );
        await this.notificationRepository.save(sellerNotification);
      }
    } catch (error: any) {
      // Log l'erreur mais ne bloque pas l'exécution de la transaction
      console.error("Erreur lors de la création des opérations/notifications:", error.message);
    }

    return {
      executedBuyOrder,
      executedSellOrder,
      updatedStock: (await this.stockRepository.findBySymbol(buyOrder.getStockSymbol()))!,
    };
  }

  /**
   * Exécute toutes les paires matchées pour une action
   */
  async executeMatchesForStock(
    matches: MatchedOrderPair[]
  ): Promise<Array<{ success: boolean; error?: string }>> {
    const results: Array<{ success: boolean; error?: string }> = [];

    for (const match of matches) {
      try {
        const result = await this.executeMatch(match);
        if (result instanceof Error) {
          results.push({ success: false, error: result.message });
        } else {
          results.push({ success: true });
        }
      } catch (error: any) {
        results.push({ success: false, error: error.message || "Erreur inconnue" });
      }
    }

    return results;
  }

  /**
   * Déclenche un matching récursif jusqu'à ce qu'il n'y ait plus de correspondances
   * Limite à 10 itérations pour éviter les boucles infinies
   */
  private async triggerRecursiveMatching(
    stockSymbol: StockSymbol,
    maxIterations: number = 10,
    currentIteration: number = 0
  ): Promise<void> {
    // Condition d'arrêt
    if (currentIteration >= maxIterations) {
      console.log(`Matching récursif arrêté après ${maxIterations} itérations`);
      return;
    }

    // Créer une instance temporaire de MatchOrdersUseCase
    const { MatchOrdersUseCase } = await import('./MatchOrdersUseCase');
    const matchOrdersUseCase = new MatchOrdersUseCase(
      this.orderRepository,
      this.stockRepository
    );

    // Chercher de nouvelles correspondances
    const matches = await matchOrdersUseCase.findMatches(stockSymbol);
    
    if (matches.length === 0) {
      // Plus de correspondances, arrêter la récursion
      return;
    }

    // Exécuter les correspondances trouvées
    const results = await this.executeMatchesForStock(matches);
    const successCount = results.filter(r => r.success).length;

    if (successCount > 0) {
      // Des ordres ont été exécutés, continuer le matching récursif
      console.log(`Matching récursif: ${successCount} match(s) exécuté(s) à l'itération ${currentIteration + 1}`);
      await this.triggerRecursiveMatching(stockSymbol, maxIterations, currentIteration + 1);
    }
  }
}

