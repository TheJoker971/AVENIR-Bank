import { OrderTypeInvalidError } from "../errors/OrderTypeInvalidError";

export type OrderTypeValue = "BUY" | "SELL";

export class OrderType {
  private static readonly VALID_TYPES: OrderTypeValue[] = ["BUY", "SELL"];

  public static create(type: string): OrderType | OrderTypeInvalidError {
    if (!OrderType.VALID_TYPES.includes(type as OrderTypeValue)) {
      return new OrderTypeInvalidError(`Type d'ordre invalide: ${type}. Types valides: ${OrderType.VALID_TYPES.join(", ")}`);
    }
    return new OrderType(type as OrderTypeValue);
  }

  private constructor(public readonly value: OrderTypeValue) {}

  public isBuy(): boolean {
    return this.value === "BUY";
  }

  public isSell(): boolean {
    return this.value === "SELL";
  }

  public equals(other: OrderType): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
