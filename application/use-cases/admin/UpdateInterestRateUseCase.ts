import { BankRepositoryInterface } from "application/repositories/BankRepositoryInterface";
import { SavingsAccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { InterestRate } from "domain/values/InterestRate";
import { BankEntity } from "domain/entities/BankEntity";

export class UpdateInterestRateUseCase {
  constructor(
    private bankRepository: BankRepositoryInterface,
    private savingsAccountRepository: SavingsAccountRepositoryInterface,
    private notificationRepository: NotificationRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(newRate: number): Promise<BankEntity | Error> {
    // Créer l'objet de valeur pour le nouveau taux
    const newRateOrError = InterestRate.create(newRate);
    if (newRateOrError instanceof Error) return newRateOrError;

    // Récupérer la banque actuelle
    const currentBank = await this.bankRepository.getCurrentBank();
    if (currentBank instanceof Error) {
      return new Error("Impossible de récupérer les informations de la banque");
    }

    const oldRate = currentBank.interestRate.value;

    // Mettre à jour le taux d'intérêt de la banque
    const updatedBank = currentBank.updateInterestRate(newRateOrError);
    await this.bankRepository.update(updatedBank);

    // Récupérer tous les comptes d'épargne pour les notifier
    const savingsAccounts = await this.savingsAccountRepository.findAllForInterestCalculation();

    // Notifier tous les clients concernés
    for (const account of savingsAccounts) {
      const user = await this.userRepository.findById(account.getOwnerId());
      if (user && !(user instanceof Error)) {
        // Créer une notification
        const notification = {
          id: Date.now() + Math.random(), // ID unique temporaire
          recipientId: account.getOwnerId(),
          recipientEmail: user.email,
          type: "INTEREST_RATE_CHANGE" as const,
          title: "Modification du taux d'épargne",
          message: `Le taux d'épargne de votre Livret A a été modifié de ${oldRate}% à ${newRate}%.`,
          isRead: false,
          createdAt: new Date()
        };

        // Note: Il faudrait créer une NotificationEntity ici
        // await this.notificationRepository.save(notification);
      }

      // Mettre à jour le taux d'intérêt du compte d'épargne
      const updatedAccount = account.updateInterestRate(newRateOrError);
      await this.savingsAccountRepository.update(updatedAccount);
    }

    return updatedBank;
  }
}
