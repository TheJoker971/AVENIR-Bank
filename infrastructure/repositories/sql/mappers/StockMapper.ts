import { StockEntity } from "domain/entities/StockEntity";
import { StockEntitySQL } from "../entities/StockEntitySQL";
import { StockSymbol } from "domain/values/StockSymbol";
import { Amount } from "domain/values/Amount";

export class StockMapper {
  static toDomain(sqlEntity: StockEntitySQL): StockEntity | null {
    try {
      const symbol = StockSymbol.create(sqlEntity.symbol);
      if (symbol instanceof Error) return null;

      const currentPrice = Amount.create(Number(sqlEntity.currentPrice));
      if (currentPrice instanceof Error) return null;

      return StockEntity.create(
        sqlEntity.id,
        symbol,
        sqlEntity.name,
        currentPrice,
        sqlEntity.totalShares
      );
    } catch (error) {
      return null;
    }
  }

  static toSQL(domainEntity: StockEntity): StockEntitySQL {
    const sqlEntity = new StockEntitySQL();
    sqlEntity.id = domainEntity.id;
    sqlEntity.symbol = domainEntity.symbol.value;
    sqlEntity.name = domainEntity.name;
    sqlEntity.currentPrice = domainEntity.currentPrice.value;
    sqlEntity.totalShares = domainEntity.totalShares;
    sqlEntity.availableShares = domainEntity.availableShares;
    return sqlEntity;
  }
}

