import { SavingsAccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { Amount } from "domain/values/Amount";

export class CalculateDailyInterestUseCase {
  constructor(
    private savingsAccountRepository: SavingsAccountRepositoryInterface,
    private notificationRepository: NotificationRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(): Promise<void> {
    // Récupérer tous les comptes d'épargne
    const savingsAccounts = await this.savingsAccountRepository.findAllForInterestCalculation();

    for (const account of savingsAccounts) {
      // Calculer les intérêts quotidiens
      const dailyInterest = account.calculateDailyInterest();
      
      if (dailyInterest.value > 0) {
        // Ajouter les intérêts au compte
        const updatedAccount = account.addInterest(dailyInterest);
        
        // Sauvegarder le compte mis à jour
        await this.savingsAccountRepository.update(updatedAccount);

        // Créer une notification pour le client
        const user = await this.userRepository.findById(account.getOwnerId());
        if (user && !(user instanceof Error)) {
          const notification = {
            id: Date.now(),
            recipientId: account.getOwnerId(),
            recipientEmail: user.email,
            type: "INTEREST_ADDED" as const,
            title: "Intérêts ajoutés",
            message: `Des intérêts de ${dailyInterest.toString()}€ ont été ajoutés à votre Livret A.`,
            isRead: false,
            createdAt: new Date()
          };
          
          // Note: Il faudrait créer une NotificationEntity ici
          // await this.notificationRepository.save(notification);
        }
      }
    }
  }
}
