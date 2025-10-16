import { Amount } from "../values/Amount";
import { InterestRate } from "../values/InterestRate";

export class CreditEntity {
  private constructor(
    public readonly id: number,
    public readonly clientId: number,
    public readonly principalAmount: Amount,
    public readonly annualInterestRate: InterestRate,
    public readonly insuranceRate: InterestRate,
    public readonly termMonths: number,
    public readonly monthlyPayment: Amount,
    public readonly remainingBalance: Amount,
    public readonly status: "ACTIVE" | "PAID_OFF" | "DEFAULTED",
    public readonly createdAt: Date = new Date(),
    public readonly nextPaymentDate: Date
  ) {}

  public static create(
    id: number,
    clientId: number,
    principalAmount: Amount,
    annualInterestRate: InterestRate,
    insuranceRate: InterestRate,
    termMonths: number
  ): CreditEntity | Error {
    if (termMonths <= 0) {
      return new Error("La durée du crédit doit être positive");
    }
    if (principalAmount.value <= 0) {
      return new Error("Le montant principal doit être positif");
    }

    const monthlyPayment = CreditEntity.calculateMonthlyPayment(
      principalAmount,
      annualInterestRate,
      insuranceRate,
      termMonths
    );

    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    return new CreditEntity(
      id,
      clientId,
      principalAmount,
      annualInterestRate,
      insuranceRate,
      termMonths,
      monthlyPayment,
      principalAmount,
      "ACTIVE",
      new Date(),
      nextPaymentDate
    );
  }

  private static calculateMonthlyPayment(
    principal: Amount,
    annualRate: InterestRate,
    insuranceRate: InterestRate,
    termMonths: number
  ): Amount {
    const monthlyRate = annualRate.value / 12;
    const monthlyInsuranceRate = insuranceRate.value / 12;
    const totalMonthlyRate = monthlyRate + monthlyInsuranceRate;

    if (totalMonthlyRate === 0) {
      return new Amount(principal.value / termMonths);
    }

    const monthlyPayment = principal.value * 
      (totalMonthlyRate * Math.pow(1 + totalMonthlyRate, termMonths)) /
      (Math.pow(1 + totalMonthlyRate, termMonths) - 1);

    return new Amount(monthlyPayment);
  }

  public makePayment(paymentAmount: Amount): CreditEntity | Error {
    if (this.status !== "ACTIVE") {
      return new Error("Impossible d'effectuer un paiement sur un crédit non actif");
    }

    if (paymentAmount.isLessThan(this.monthlyPayment)) {
      return new Error("Le paiement doit être au moins égal à la mensualité");
    }

    const interestAmount = this.calculateInterestAmount();
    const insuranceAmount = this.calculateInsuranceAmount();
    const principalPayment = paymentAmount.subtract(interestAmount).subtract(insuranceAmount);

    const newRemainingBalance = this.remainingBalance.subtract(principalPayment);
    
    if (newRemainingBalance.value <= 0) {
      return new CreditEntity(
        this.id,
        this.clientId,
        this.principalAmount,
        this.annualInterestRate,
        this.insuranceRate,
        this.termMonths,
        this.monthlyPayment,
        new Amount(0),
        "PAID_OFF",
        this.createdAt,
        this.nextPaymentDate
      );
    }

    const nextPaymentDate = new Date(this.nextPaymentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    return new CreditEntity(
      this.id,
      this.clientId,
      this.principalAmount,
      this.annualInterestRate,
      this.insuranceRate,
      this.termMonths,
      this.monthlyPayment,
      newRemainingBalance,
      this.status,
      this.createdAt,
      nextPaymentDate
    );
  }

  private calculateInterestAmount(): Amount {
    const monthlyRate = this.annualInterestRate.value / 12;
    return this.remainingBalance.multiply(monthlyRate);
  }

  private calculateInsuranceAmount(): Amount {
    const monthlyInsuranceRate = this.insuranceRate.value / 12;
    return this.remainingBalance.multiply(monthlyInsuranceRate);
  }

  public getRemainingPayments(): number {
    if (this.status === "PAID_OFF") {
      return 0;
    }
    
    const monthlyRate = (this.annualInterestRate.value + this.insuranceRate.value) / 12;
    if (monthlyRate === 0) {
      return Math.ceil(this.remainingBalance.value / this.monthlyPayment.value);
    }

    const remainingPayments = Math.log(1 + (this.remainingBalance.value * monthlyRate) / this.monthlyPayment.value) /
      Math.log(1 + monthlyRate);

    return Math.ceil(remainingPayments);
  }

  public getTotalInterestPaid(): Amount {
    const totalPaid = this.principalAmount.subtract(this.remainingBalance);
    const totalInsurancePaid = this.principalAmount.multiply(this.insuranceRate.value);
    return totalPaid.subtract(totalInsurancePaid);
  }

  public isOverdue(): boolean {
    return this.status === "ACTIVE" && new Date() > this.nextPaymentDate;
  }

  public markAsDefaulted(): CreditEntity {
    return new CreditEntity(
      this.id,
      this.clientId,
      this.principalAmount,
      this.annualInterestRate,
      this.insuranceRate,
      this.termMonths,
      this.monthlyPayment,
      this.remainingBalance,
      "DEFAULTED",
      this.createdAt,
      this.nextPaymentDate
    );
  }

  public getClientId(): number {
    return this.clientId;
  }

  public getPrincipalAmount(): Amount {
    return this.principalAmount;
  }

  public getRemainingBalance(): Amount {
    return this.remainingBalance;
  }

  public getMonthlyPayment(): Amount {
    return this.monthlyPayment;
  }

  public getStatus(): string {
    return this.status;
  }

  public getNextPaymentDate(): Date {
    return this.nextPaymentDate;
  }
}
