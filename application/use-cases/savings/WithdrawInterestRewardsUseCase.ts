import { SavingsAccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { NotificationRepositoryInterface } from "application/repositories/NotificationRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { Amount } from "domain/values/Amount";
import { TransferData } from "domain/values/TransferData";
import { OperationEntity } from "domain/entities/OperationEntity";
import { NotificationEntity } from "domain/entities/NotificationEntity";

/**
 * Use case pour retirer les intérêts accumulés (récompenses) d'un compte épargne
 * et les transférer vers le compte courant du client
 */
export class WithdrawInterestRewardsUseCase {
  constructor(
    private savingsAccountRepository: SavingsAccountRepositoryInterface,
    private accountRepository: AccountRepositoryInterface,
    private operationRepository: OperationRepositoryInterface,
    private notificationRepository: NotificationRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(savingsAccountId: number, userId: number): Promise<{ 
    success: true; 
    withdrawnAmount: number;
    message: string;
  } | Error> {
    // 1. Récupérer le compte épargne
    const savingsAccount = await this.savingsAccountRepository.findById(savingsAccountId);
    if (!savingsAccount) {
      return new Error("Compte épargne non trouvé");
    }

    // 2. Vérifier que l'utilisateur est bien le propriétaire
    if (savingsAccount.getOwnerId() !== userId) {
      return new Error("Vous n'êtes pas autorisé à effectuer cette opération");
    }

    // 3. Calculer les intérêts accumulés
    const accumulatedInterest = savingsAccount.calculateAccumulatedInterest();
    
    if (accumulatedInterest.value <= 0) {
      return new Error("Aucun intérêt à retirer pour le moment");
    }

    // 4. Récupérer le compte courant du client
    const accounts = await this.accountRepository.findByOwnerId(userId);
    if (accounts.length === 0) {
      return new Error("Aucun compte courant trouvé pour recevoir les intérêts");
    }
    const currentAccount = accounts[0]; // Premier compte courant

    // 5. Créditer les intérêts sur le compte courant
    const creditedAccount = currentAccount.credit(accumulatedInterest);
    if (creditedAccount instanceof Error) {
      return creditedAccount;
    }
    await this.accountRepository.update(creditedAccount);

    // 6. Mettre à jour la date du dernier calcul d'intérêts sur le compte épargne
    // Les intérêts ont été "retirés" donc on remet à zéro le compteur
    const updatedSavingsAccount = savingsAccount.addInterest(Amount.create(0) as Amount);
    await this.savingsAccountRepository.update(updatedSavingsAccount);

    // 7. Créer une opération pour tracer le transfert
    const user = await this.userRepository.findById(userId);
    if (user && !(user instanceof Error)) {
      try {
        const transferDataOrError = TransferData.create(
          'AVENIR Bank',
          'Livret A',
          savingsAccount.iban,
          user.lastname,
          user.firstname,
          currentAccount.iban,
          true,
          `Retrait des intérêts accumulés du Livret A`
        );

        if (!(transferDataOrError instanceof Error)) {
          const operationId = Date.now();
          const operationOrError = OperationEntity.create(
            operationId,
            transferDataOrError,
            accumulatedInterest,
            "COMPLETED"
          );

          if (!(operationOrError instanceof Error)) {
            const completedOp = operationOrError.complete();
            await this.operationRepository.save(completedOp);
          }
        }

        // 8. Créer une notification
        const notificationId = Date.now() + 1;
        const notification = NotificationEntity.createTransactionCompletedNotification(
          notificationId,
          user.id,
          user.email,
          `Retrait des intérêts du Livret A`,
          accumulatedInterest.value,
          currentAccount.iban.value
        );
        await this.notificationRepository.save(notification);
      } catch (error) {
        console.error('Erreur lors de la création de l\'opération/notification:', error);
      }
    }

    return {
      success: true,
      withdrawnAmount: accumulatedInterest.value,
      message: `${accumulatedInterest.value.toFixed(2)}€ d'intérêts ont été transférés vers votre compte courant`
    };
  }
}

