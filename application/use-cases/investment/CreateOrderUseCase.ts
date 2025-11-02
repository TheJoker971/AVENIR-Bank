import { OrderEntity } from "domain/entities/OrderEntity";
import { OrderRepositoryInterface } from "application/repositories/OrderRepositoryInterface";
import { StockRepositoryInterface } from "application/repositories/StockRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { StockHoldingRepositoryInterface } from "application/repositories/StockHoldingRepositoryInterface";
import { MatchOrdersUseCase } from "./MatchOrdersUseCase";
import { ExecuteMatchedOrdersUseCase } from "./ExecuteMatchedOrdersUseCase";
import { StockSymbol } from "domain/values/StockSymbol";
import { Amount } from "domain/values/Amount";

export class CreateOrderUseCase {
  private matchOrdersUseCase: MatchOrdersUseCase;
  private executeMatchedOrdersUseCase: ExecuteMatchedOrdersUseCase;

  constructor(
    private orderRepository: OrderRepositoryInterface,
    private stockRepository: StockRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private accountRepository: AccountRepositoryInterface,
    private stockHoldingRepository: StockHoldingRepositoryInterface,
    private operationRepository: any // OperationRepositoryInterface
  ) {
    this.matchOrdersUseCase = new MatchOrdersUseCase(orderRepository, stockRepository);
    this.executeMatchedOrdersUseCase = new ExecuteMatchedOrdersUseCase(
      orderRepository,
      stockRepository,
      accountRepository,
      stockHoldingRepository,
      operationRepository
    );
  }

  async execute(
    clientId: number,
    stockSymbol: string,
    orderType: "BUY" | "SELL",
    quantity: number,
    price: number
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

    // Créer les objets de valeur
    const amountOrError = Amount.create(price);
    if (amountOrError instanceof Error) return amountOrError;

    // Vérifier les conditions spécifiques selon le type d'ordre
    if (orderType === "BUY") {
      // Vérifier que le client a assez d'argent
      const accounts = await this.accountRepository.findByOwnerId(clientId);
      if (accounts.length === 0) {
        return new Error("Le client n'a pas de compte bancaire");
      }

      // Calculer le montant total avec frais
      const totalAmount = amountOrError.multiply(quantity);
      const fees = Amount.create(1);
      if (fees instanceof Error) return fees;
      const totalWithFees = totalAmount.add(fees);

      // Vérifier le solde total des comptes
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.getBalance().value, 0);
      if (totalBalance < totalWithFees.value) {
        return new Error(`Solde insuffisant. Montant requis: ${totalWithFees.value.toFixed(2)}€, Solde disponible: ${totalBalance.toFixed(2)}€`);
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
        amountOrError,
        clientId
      );
    } else {
      order = OrderEntity.createSellOrder(
        Date.now(), // ID temporaire
        stockSymbolOrError,
        quantity,
        amountOrError,
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
