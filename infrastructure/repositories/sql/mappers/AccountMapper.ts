import { AccountEntity } from "domain/entities/AccountEntity";
import { SavingsAccountEntity } from "domain/entities/SavingsAccountEntity";
import { AccountEntitySQL } from "../entities/AccountEntitySQL";
import { SavingsAccountEntitySQL } from "../entities/SavingsAccountEntitySQL";
import { Iban } from "domain/values/Iban";
import { Amount } from "domain/values/Amount";
import { InterestRate } from "domain/values/InterestRate";
import { CountryCode } from "domain/values/CountryCode";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { AccountNumber } from "domain/values/AccountNumber";
import { RibKey } from "domain/values/RibKey";

export class AccountMapper {
  static toDomain(sqlEntity: AccountEntitySQL): AccountEntity | null {
    try {
      // Note: AccountEntity est immuable et n'a pas d'ID
      // Pour mapper depuis SQL, on doit recréer avec les composants de l'IBAN
      // On parse l'IBAN: FR + 2 chiffres checksum + BBAN (bank + branch + account + key)
      const ibanValue = sqlEntity.iban;
      if (ibanValue.length < 15) return null;

      const countryCode = CountryCode.create(ibanValue.substring(0, 2));
      if (countryCode instanceof Error) return null;

      // BBAN commence après les 4 premiers caractères (FR + checksum)
      const bban = ibanValue.substring(4);
      if (bban.length < 23) return null;

      const bankCode = BankCode.create(bban.substring(0, 5));
      if (bankCode instanceof Error) return null;

      const branchCode = BranchCode.create(bban.substring(5, 10));
      if (branchCode instanceof Error) return null;

      const accountNumberStr = bban.substring(10, 21);
      const accountNumber = AccountNumber.create(accountNumberStr);
      if (accountNumber instanceof Error) return null;

      const ribKey = RibKey.create(bban.substring(21, 23));
      if (ribKey instanceof Error) return null;

      const balance = Amount.create(Number(sqlEntity.balance));
      if (balance instanceof Error) return null;

      // Créer l'entité avec les composants
      const result = AccountEntity.create(
        countryCode,
        bankCode,
        branchCode,
        ribKey.getValue(),
        sqlEntity.balance,
        sqlEntity.ownerId
      );
      
      return result instanceof Error ? null : result;
    } catch (error) {
      return null;
    }
  }

  static toSQL(domainEntity: AccountEntity): AccountEntitySQL {
    const sqlEntity = new AccountEntitySQL();
    sqlEntity.accountNumber = domainEntity.accountNumber.getValue();
    sqlEntity.iban = domainEntity.iban.value;
    sqlEntity.balance = domainEntity.balance.value;
    sqlEntity.ownerId = domainEntity.ownerId;
    return sqlEntity;
  }
}

export class SavingsAccountMapper {
  static toDomain(sqlEntity: SavingsAccountEntitySQL): SavingsAccountEntity | null {
    try {
      // Créer l'IBAN - simplifié pour l'instant
      // En production, il faudrait parser l'IBAN correctement
      const ibanValue = sqlEntity.iban;
      // Créer un IBAN wrapper simple
      const iban = Object.create(Iban.prototype);
      (iban as any).value = ibanValue;

      const balance = Amount.create(sqlEntity.balance);
      if (balance instanceof Error) return null;

      const interestRate = InterestRate.create(sqlEntity.interestRate);
      if (interestRate instanceof Error) return null;

      return SavingsAccountEntity.create(
        sqlEntity.id,
        iban,
        balance,
        sqlEntity.ownerId,
        interestRate
      );
    } catch (error) {
      return null;
    }
  }

  static toSQL(domainEntity: SavingsAccountEntity): SavingsAccountEntitySQL {
    const sqlEntity = new SavingsAccountEntitySQL();
    sqlEntity.id = domainEntity.id;
    sqlEntity.iban = domainEntity.iban.value;
    sqlEntity.balance = domainEntity.balance.value;
    sqlEntity.ownerId = domainEntity.ownerId;
    sqlEntity.interestRate = domainEntity.interestRate.value;
    sqlEntity.lastInterestCalculation = domainEntity.lastInterestCalculation;
    return sqlEntity;
  }
}

