import { AccountEntity } from "domain/entities/AccountEntity";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { AccountNumber } from "domain/values/AccountNumber";
import { Iban } from "domain/values/Iban";
import { RibKey } from "domain/values/RibKey";
import { Amount } from "domain/values/Amount";

export class CreateAccountUseCase {
  constructor(
    private accountRepository: AccountRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(
    ownerId: number,
    countryCode: string,
    bankCode: string,
    branchCode: string,
    ribKey: string
  ): Promise<AccountEntity | Error> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(ownerId);
    if (user instanceof Error) {
      return new Error("Utilisateur non trouvé");
    }

    // Créer les objets de valeur
    const bankCodeOrError = BankCode.create(bankCode);
    if (bankCodeOrError instanceof Error) return bankCodeOrError;

    const branchCodeOrError = BranchCode.create(branchCode);
    if (branchCodeOrError instanceof Error) return branchCodeOrError;

    const ribKeyOrError = RibKey.create(ribKey);
    if (ribKeyOrError instanceof Error) return ribKeyOrError;

    // Générer un numéro de compte unique
    let accountNumber: AccountNumber;
    let iban: Iban;
    let attempts = 0;
    const maxAttempts = 100; // Limite de sécurité pour éviter une boucle infinie

    do {
      // Générer un nouveau numéro de compte
      accountNumber = AccountNumber.generateAccountNumber();

      // Créer un IBAN temporaire pour vérifier l'unicité
      const tempIbanOrError = Iban.create(
        countryCode as any,
        bankCodeOrError,
        branchCodeOrError,
        accountNumber,
        ribKeyOrError
      );

      if (tempIbanOrError instanceof Error) {
        return tempIbanOrError;
      }

      // Vérifier si cet IBAN existe déjà
      const existingAccount = await this.accountRepository.findByIban(tempIbanOrError);
      
      if (!existingAccount) {
        // Le numéro de compte est unique, on peut l'utiliser
        iban = tempIbanOrError;
        break;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        return new Error("Impossible de générer un numéro de compte unique après plusieurs tentatives");
      }
    } while (true);

    // Créer le compte avec le numéro unique en utilisant la méthode statique create
    const accountOrError = AccountEntity.create(
      countryCode as any,
      bankCodeOrError,
      branchCodeOrError,
      ribKey,
      0,
      ownerId,
      accountNumber // Passer le numéro de compte déjà généré et vérifié
    );

    if (accountOrError instanceof Error) {
      return accountOrError;
    }

    // Sauvegarder le compte
    await this.accountRepository.save(accountOrError);

    return accountOrError;
  }
}
