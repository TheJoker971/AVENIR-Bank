/**
 * Use Case: Créer un bénéficiaire
 */
import { BeneficiaryEntity } from "domain/entities/BeneficiaryEntity";
import { BeneficiaryRepositoryInterface } from "application/repositories/BeneficiaryRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";

export class CreateBeneficiaryUseCase {
  constructor(
    private beneficiaryRepository: BeneficiaryRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(
    ownerId: number,
    name: string,
    iban: string
  ): Promise<BeneficiaryEntity | Error> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(ownerId);
    if (user instanceof Error) {
      return new Error("Utilisateur non trouvé");
    }

    // Vérifier que le bénéficiaire n'existe pas déjà pour ce client
    const existing = await this.beneficiaryRepository.findByOwnerIdAndIban(ownerId, iban);
    if (existing) {
      return new Error("Ce bénéficiaire existe déjà dans votre liste");
    }

    // Créer le bénéficiaire
    const beneficiaryId = Date.now();
    const beneficiary = BeneficiaryEntity.create(
      beneficiaryId,
      ownerId,
      name,
      iban
    );

    if (beneficiary instanceof Error) {
      return beneficiary;
    }

    // Sauvegarder le bénéficiaire
    await this.beneficiaryRepository.save(beneficiary);

    return beneficiary;
  }
}

