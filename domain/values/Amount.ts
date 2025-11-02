import { AmountInvalidError } from "../errors/AmountInvalidError";

export type AmountType = number;

export class Amount {
  private static readonly MIN_AMOUNT = 0;
  private static readonly MAX_AMOUNT = 999999999.99;

  public static create(amount: number): Amount | AmountInvalidError {
    if (amount < Amount.MIN_AMOUNT) {
      return new AmountInvalidError("Le montant ne peut pas être négatif");
    }
    if (amount > Amount.MAX_AMOUNT) {
      return new AmountInvalidError("Le montant dépasse la limite autorisée");
    }
    if (!Number.isFinite(amount)) {
      return new AmountInvalidError("Le montant doit être un nombre valide");
    }
    return new Amount(Math.round(amount * 100) / 100); // Arrondi à 2 décimales
  }

  private constructor(public readonly value: AmountType) {}

  public add(other: Amount): Amount {
    return new Amount(this.value + other.value);
  }

  public subtract(other: Amount): Amount {
    return new Amount(this.value - other.value);
  }

  public multiply(factor: number): Amount {
    return new Amount(this.value * factor);
  }

  public divide(divisor: number): Amount | AmountInvalidError {
    if (divisor === 0) {
      return new AmountInvalidError("Division par zéro impossible");
    }
    if (!Number.isFinite(divisor)) {
      return new AmountInvalidError("Le diviseur doit être un nombre valide");
    }
    return new Amount(this.value / divisor);
  }

  public isGreaterThan(other: Amount): boolean {
    return this.value > other.value;
  }

  public isLessThan(other: Amount): boolean {
    return this.value < other.value;
  }

  public equals(other: Amount): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toFixed(2);
  }
}
