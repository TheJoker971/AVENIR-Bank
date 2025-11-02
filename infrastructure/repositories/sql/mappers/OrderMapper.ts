import { OrderEntity } from "domain/entities/OrderEntity";
import { OrderEntitySQL } from "../entities/OrderEntitySQL";
import { StockSymbol } from "domain/values/StockSymbol";
import { OrderType } from "domain/values/OrderType";
import { OrderStatus } from "domain/values/OrderStatus";
import { Amount } from "domain/values/Amount";

export class OrderMapper {
  static toDomain(sqlEntity: OrderEntitySQL): OrderEntity | null {
    try {
      const stockSymbol = StockSymbol.create(sqlEntity.stockSymbol);
      if (stockSymbol instanceof Error) return null;

      const orderType = OrderType.create(sqlEntity.orderType);
      if (orderType instanceof Error) return null;

      const price = Amount.create(Number(sqlEntity.price));
      if (price instanceof Error) return null;

      if (sqlEntity.orderType === "BUY") {
        const order = OrderEntity.createBuyOrder(
          sqlEntity.id,
          stockSymbol,
          sqlEntity.quantity,
          price,
          sqlEntity.clientId
        );
        if (order instanceof Error) return null;
        
        // Mettre à jour le statut si nécessaire
        const status = OrderStatus.create(sqlEntity.status);
        if (!(status instanceof Error) && !order.isPending() && sqlEntity.status !== "PENDING") {
          // L'ordre a été exécuté, on doit recréer avec le bon statut
          return order.execute();
        }
        return order;
      } else {
        const order = OrderEntity.createSellOrder(
          sqlEntity.id,
          stockSymbol,
          sqlEntity.quantity,
          price,
          sqlEntity.clientId
        );
        if (order instanceof Error) return null;
        
        const status = OrderStatus.create(sqlEntity.status);
        if (!(status instanceof Error) && !order.isPending() && sqlEntity.status !== "PENDING") {
          return order.execute();
        }
        return order;
      }
    } catch (error) {
      return null;
    }
  }

  static toSQL(domainEntity: OrderEntity): OrderEntitySQL {
    const sqlEntity = new OrderEntitySQL();
    sqlEntity.id = domainEntity.id;
    sqlEntity.stockSymbol = domainEntity.getStockSymbol().value;
    sqlEntity.orderType = domainEntity.orderType.value;
    sqlEntity.quantity = domainEntity.getQuantity();
    sqlEntity.price = domainEntity.getPrice().value;
    sqlEntity.totalAmount = domainEntity.getTotalAmount().value;
    sqlEntity.status = domainEntity.status.value;
    sqlEntity.clientId = domainEntity.getClientId();
    sqlEntity.executedAt = domainEntity.executedAt;
    return sqlEntity;
  }
}

