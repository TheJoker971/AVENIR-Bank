import { CreditEntity } from "domain/entities/CreditEntity";
import { CreditEntitySQL } from "../entities/CreditEntitySQL";
import { Amount } from "domain/values/Amount";
import { InterestRate } from "domain/values/InterestRate";

export class CreditMapper {
  static toDomain(sqlEntity: CreditEntitySQL): CreditEntity | null {
    try {
      const principalAmount = Amount.create(Number(sqlEntity.principalAmount));
      if (principalAmount instanceof Error) return null;

      const annualInterestRate = InterestRate.create(sqlEntity.annualInterestRate);
      if (annualInterestRate instanceof Error) return null;

      const insuranceRate = InterestRate.create(sqlEntity.insuranceRate);
      if (insuranceRate instanceof Error) return null;

      const monthlyPayment = Amount.create(Number(sqlEntity.monthlyPayment));
      if (monthlyPayment instanceof Error) return null;

      const remainingBalance = Amount.create(Number(sqlEntity.remainingBalance));
      if (remainingBalance instanceof Error) return null;

      // Créer le crédit avec les valeurs calculées
      const credit = CreditEntity.create(
        sqlEntity.id,
        sqlEntity.clientId,
        principalAmount,
        annualInterestRate,
        insuranceRate,
        sqlEntity.termMonths
      );
      if (credit instanceof Error) return null;

      // Note: Il faudrait créer une méthode pour restaurer un crédit avec un balance restant
      // Pour l'instant, on retourne le crédit créé
      return credit;
    } catch (error) {
      return null;
    }
  }

  static toSQL(domainEntity: CreditEntity): CreditEntitySQL {
    const sqlEntity = new CreditEntitySQL();
    sqlEntity.id = domainEntity.id;
    sqlEntity.clientId = domainEntity.getClientId();
    sqlEntity.principalAmount = domainEntity.getPrincipalAmount().value;
    sqlEntity.annualInterestRate = domainEntity.annualInterestRate.value;
    sqlEntity.insuranceRate = domainEntity.insuranceRate.value;
    sqlEntity.termMonths = domainEntity.termMonths;
    sqlEntity.monthlyPayment = domainEntity.getMonthlyPayment().value;
    sqlEntity.remainingBalance = domainEntity.getRemainingBalance().value;
    sqlEntity.status = domainEntity.getStatus();
    sqlEntity.nextPaymentDate = domainEntity.getNextPaymentDate();
    sqlEntity.createdAt = domainEntity.createdAt;
    return sqlEntity;
  }
}

