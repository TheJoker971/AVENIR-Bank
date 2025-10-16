import { CreditEntity } from "domain/entities/CreditEntity";
import { CreditRepositoryInterface } from "application/repositories/CreditRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { Amount } from "domain/values/Amount";
import { InterestRate } from "domain/values/InterestRate";

export class CreateCreditUseCase {
  constructor(
    private creditRepository: CreditRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(
    clientId: number,
    principalAmount: number,
    annualInterestRate: number,
    insuranceRate: number,
    termMonths: number
  ): Promise<CreditEntity | Error> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(clientId);
    if (user instanceof Error) {
      return new Error("Utilisateur non trouvé");
    }

    // Créer les objets de valeur
    const principalAmountOrError = Amount.create(principalAmount);
    if (principalAmountOrError instanceof Error) return principalAmountOrError;

    const annualRateOrError = InterestRate.create(annualInterestRate);
    if (annualRateOrError instanceof Error) return annualRateOrError;

    const insuranceRateOrError = InterestRate.create(insuranceRate);
    if (insuranceRateOrError instanceof Error) return insuranceRateOrError;

    // Créer le crédit
    const creditOrError = CreditEntity.create(
      Date.now(), // ID temporaire
      clientId,
      principalAmountOrError,
      annualRateOrError,
      insuranceRateOrError,
      termMonths
    );

    if (creditOrError instanceof Error) {
      return creditOrError;
    }

    // Sauvegarder le crédit
    await this.creditRepository.save(creditOrError);

    return creditOrError;
  }
}
