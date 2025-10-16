import { OrderStatusInvalidError } from "../errors/OrderStatusInvalidError";

export type OrderStatusValue = "PENDING" | "EXECUTED" | "CANCELLED" | "PARTIALLY_EXECUTED";

export class OrderStatus {
  private static readonly VALID_STATUSES: OrderStatusValue[] = [
    "PENDING",
    "EXECUTED", 
    "CANCELLED",
    "PARTIALLY_EXECUTED"
  ];

  public static create(status: string): OrderStatus | OrderStatusInvalidError {
    if (!OrderStatus.VALID_STATUSES.includes(status as OrderStatusValue)) {
      return new OrderStatusInvalidError(`Statut d'ordre invalide: ${status}. Statuts valides: ${OrderStatus.VALID_STATUSES.join(", ")}`);
    }
    return new OrderStatus(status as OrderStatusValue);
  }

  public static pending(): OrderStatus {
    return new OrderStatus("PENDING");
  }

  public static executed(): OrderStatus {
    return new OrderStatus("EXECUTED");
  }

  public static cancelled(): OrderStatus {
    return new OrderStatus("CANCELLED");
  }

  public static partiallyExecuted(): OrderStatus {
    return new OrderStatus("PARTIALLY_EXECUTED");
  }

  private constructor(public readonly value: OrderStatusValue) {}

  public isPending(): boolean {
    return this.value === "PENDING";
  }

  public isExecuted(): boolean {
    return this.value === "EXECUTED";
  }

  public isCancelled(): boolean {
    return this.value === "CANCELLED";
  }

  public isPartiallyExecuted(): boolean {
    return this.value === "PARTIALLY_EXECUTED";
  }

  public equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
