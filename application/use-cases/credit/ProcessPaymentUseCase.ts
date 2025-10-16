import { CreditEntity } from "domain/entities/CreditEntity";
import { CreditRepositoryInterface } from "application/repositories/CreditRepositoryInterface";
import { Amount } from "domain/values/Amount";

export class ProcessPaymentUseCase {
  constructor(
    private creditRepository: CreditRepositoryInterface
  ) {}

  async execute(creditId: number, paymentAmount: number): Promise<CreditEntity | Error> {
    // Récupérer le crédit
    const credit = await this.creditRepository.findById(creditId);
    if (!credit) {
      return new Error("Crédit non trouvé");
    }

    if (credit.getStatus() !== "ACTIVE") {
      return new Error("Le crédit n'est pas actif");
    }

    // Créer l'objet de valeur pour le montant
    const paymentAmountOrError = Amount.create(paymentAmount);
    if (paymentAmountOrError instanceof Error) return paymentAmountOrError;

    // Traiter le paiement
    const updatedCredit = credit.makePayment(paymentAmountOrError);
    if (updatedCredit instanceof Error) {
      return updatedCredit;
    }

    // Sauvegarder le crédit mis à jour
    await this.creditRepository.update(updatedCredit);

    return updatedCredit;
  }
}
