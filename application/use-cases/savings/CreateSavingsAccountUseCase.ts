import { SavingsAccountEntity } from "domain/entities/SavingsAccountEntity";
import { SavingsAccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { BankRepositoryInterface } from "application/repositories/BankRepositoryInterface";
import { CountryCode } from "domain/values/CountryCode";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { Amount } from "domain/values/Amount";
import { Iban } from "domain/values/Iban";

export class CreateSavingsAccountUseCase {
  constructor(
    private savingsAccountRepository: SavingsAccountRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private bankRepository: BankRepositoryInterface
  ) {}

  async execute(
    ownerId: number,
    initialAmount: number,
    countryCode: string,
    bankCode: string,
    branchCode: string,
    ribKey: string
  ): Promise<SavingsAccountEntity | Error> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(ownerId);
    if (user instanceof Error) {
      return new Error("Utilisateur non trouvé");
    }

    // Récupérer le taux d'intérêt actuel de la banque
    const bank = await this.bankRepository.getCurrentBank();
    if (!bank) {
      return new Error("Impossible de récupérer les informations de la banque");
    }

    // Valider et créer les objets de valeur
    // CountryCode est un type, on valide qu'il est valide
    const validCountryCodes: CountryCode[] = ["FR", "DE", "ES", "IT"];
    if (!validCountryCodes.includes(countryCode as CountryCode)) {
      return new Error("Code pays invalide");
    }
    const countryCodeValid = countryCode as CountryCode;

    const bankCodeOrError = BankCode.create(bankCode);
    if (bankCodeOrError instanceof Error) return bankCodeOrError;

    const branchCodeOrError = BranchCode.create(branchCode);
    if (branchCodeOrError instanceof Error) return branchCodeOrError;

    const amountOrError = Amount.create(initialAmount);
    if (amountOrError instanceof Error) return amountOrError;

    // Créer l'IBAN
    const ibanOrError = Iban.create(
      countryCodeValid,
      bankCodeOrError,
      branchCodeOrError,
      // On va générer un numéro de compte temporaire
      { value: Math.floor(Math.random() * 100000000000).toString().padStart(11, "0") } as any,
      { value: ribKey } as any
    );

    if (ibanOrError instanceof Error) return ibanOrError;

    // Créer le compte d'épargne
    const savingsAccount = SavingsAccountEntity.create(
      Date.now(), // ID temporaire
      ibanOrError,
      amountOrError,
      ownerId,
      bank.interestRate
    );

    // Sauvegarder le compte d'épargne
    await this.savingsAccountRepository.save(savingsAccount);

    return savingsAccount;
  }
}
