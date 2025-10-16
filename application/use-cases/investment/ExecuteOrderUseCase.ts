import { OrderEntity } from "domain/entities/OrderEntity";
import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { Amount } from "domain/values/Amount";

export class ExecuteOrderUseCase {
  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface,
    private accountRepository: AccountRepositoryInterface
  ) {}

  async execute(orderId: number): Promise<OrderEntity | Error> {
    // Récupérer l'ordre
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return new Error("Ordre non trouvé");
    }

    if (!order.isPending()) {
      return new Error("L'ordre n'est pas en attente d'exécution");
    }

    // Récupérer l'action
    const stock = await this.stockRepository.findBySymbol(order.getStockSymbol());
    if (!stock) {
      return new Error("Action non trouvée");
    }

    // Vérifier la disponibilité des actions
    if (order.isBuyOrder()) {
      if (order.getQuantity() > stock.getAvailableShares()) {
        return new Error("Quantité d'actions insuffisante disponible");
      }
    }

    // Exécuter l'ordre
    const executedOrder = order.execute();

    // Mettre à jour l'action
    let updatedStock;
    if (order.isBuyOrder()) {
      updatedStock = stock.executeBuyOrder(order.getQuantity());
    } else {
      updatedStock = stock.executeSellOrder(order.getQuantity());
    }

    if (updatedStock instanceof Error) {
      return updatedStock;
    }

    // Calculer le montant total avec les frais
    const totalAmount = executedOrder.getTotalWithFees();

    // Mettre à jour les comptes (débit/crédit)
    // Note: Ici on devrait déduire/ajouter le montant du compte du client
    // et gérer les frais de transaction

    // Sauvegarder les modifications
    await this.orderRepository.update(executedOrder);
    await this.stockRepository.update(updatedStock);

    return executedOrder;
  }
}
