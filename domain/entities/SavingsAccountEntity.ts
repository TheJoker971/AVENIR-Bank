import { Iban } from "../values/Iban";
import { Amount } from "../values/Amount";
import { InterestRate } from "../values/InterestRate";

export class SavingsAccountEntity {
  private constructor(
    public readonly id: number,
    public readonly iban: Iban,
    public readonly balance: Amount,
    public readonly ownerId: number,
    public readonly interestRate: InterestRate,
    public readonly lastInterestCalculation: Date,
    public readonly createdAt: Date = new Date()
  ) {}

  public static create(
    id: number,
    iban: Iban,
    initialBalance: Amount,
    ownerId: number,
    interestRate: InterestRate
  ): SavingsAccountEntity {
    return new SavingsAccountEntity(
      id,
      iban,
      initialBalance,
      ownerId,
      interestRate,
      new Date()
    );
  }

  public calculateDailyInterest(): Amount {
    const dailyRate = this.interestRate.value / 365;
    return this.balance.multiply(dailyRate);
  }

  public addInterest(interest: Amount): SavingsAccountEntity {
    const newBalance = this.balance.add(interest);
    return new SavingsAccountEntity(
      this.id,
      this.iban,
      newBalance,
      this.ownerId,
      this.interestRate,
      new Date(),
      this.createdAt
    );
  }

  public deposit(amount: Amount): SavingsAccountEntity {
    const newBalance = this.balance.add(amount);
    return new SavingsAccountEntity(
      this.id,
      this.iban,
      newBalance,
      this.ownerId,
      this.interestRate,
      this.lastInterestCalculation,
      this.createdAt
    );
  }

  public withdraw(amount: Amount): SavingsAccountEntity | Error {
    if (amount.isGreaterThan(this.balance)) {
      return new Error("Fonds insuffisants pour ce retrait");
    }
    const newBalance = this.balance.subtract(amount);
    return new SavingsAccountEntity(
      this.id,
      this.iban,
      newBalance,
      this.ownerId,
      this.interestRate,
      this.lastInterestCalculation,
      this.createdAt
    );
  }

  public updateInterestRate(newRate: InterestRate): SavingsAccountEntity {
    return new SavingsAccountEntity(
      this.id,
      this.iban,
      this.balance,
      this.ownerId,
      newRate,
      this.lastInterestCalculation,
      this.createdAt
    );
  }

  public getBalance(): Amount {
    return this.balance;
  }

  public getOwnerId(): number {
    return this.ownerId;
  }

  public getIban(): Iban {
    return this.iban;
  }
}
