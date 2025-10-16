import { AccountEntity } from "domain/entities/AccountEntity";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";

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

    // Créer le compte
    const accountOrError = AccountEntity.create(
      countryCode as any, // CountryCode est un type, pas une classe
      bankCodeOrError,
      branchCodeOrError,
      ribKey,
      0, // balance par défaut
      ownerId
    );

    if (accountOrError instanceof Error) {
      return accountOrError;
    }

    // Sauvegarder le compte
    await this.accountRepository.save(accountOrError);

    return accountOrError;
  }
}
