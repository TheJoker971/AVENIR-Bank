import { BankRepositoryInterface } from "application/repositories/BankRepositoryInterface";
import { SavingsAccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { InterestRate } from "domain/values/InterestRate";
import { BankEntity } from "domain/entities/BankEntity";
import { NotificationEntity } from "domain/entities/NotificationEntity";

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
        // Créer une notification avec NotificationEntity
        const notificationId = Date.now() * 1000 + Math.floor(Math.random() * 1000); // ID unique temporaire
        const notification = NotificationEntity.createInterestRateChangeNotification(
          notificationId,
          account.getOwnerId(),
          user.email,
          oldRate,
          newRate
        );
        await this.notificationRepository.save(notification);
      }

      // Mettre à jour le taux d'intérêt du compte d'épargne
      const updatedAccount = account.updateInterestRate(newRateOrError);
      await this.savingsAccountRepository.update(updatedAccount);
    }

    return updatedBank;
  }
}
