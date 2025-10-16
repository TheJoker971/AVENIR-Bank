import { OperationEntity } from "domain/entities/OperationEntity";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";

export class ExecuteTransferUseCase {
  constructor(
    private operationRepository: OperationRepositoryInterface,
    private accountRepository: AccountRepositoryInterface
  ) {}

  async execute(operationId: number): Promise<OperationEntity | Error> {
    // Récupérer l'opération
    const operation = await this.operationRepository.findById(operationId);
    if (!operation) {
      return new Error("Opération non trouvée");
    }

    if (!operation.isPending()) {
      return new Error("L'opération n'est pas en attente d'exécution");
    }

    try {
      // Récupérer les comptes
      const senderAccount = await this.accountRepository.findByIban(operation.getTransferData().getSenderIban());
      const receiverAccount = await this.accountRepository.findByIban(operation.getTransferData().getReceiverIban());

      if (!senderAccount) {
        return new Error("Compte expéditeur non trouvé");
      }

      if (!receiverAccount) {
        return new Error("Compte destinataire non trouvé");
      }

      // Vérifier à nouveau les fonds (au cas où ils auraient changé)
      if (senderAccount.getBalance().isLessThan(operation.getAmount())) {
        const failedOperation = operation.fail();
        await this.operationRepository.update(failedOperation);
        return new Error("Fonds insuffisants pour exécuter le virement");
      }

      // Effectuer le virement
      const updatedSenderAccount = senderAccount.withdraw(operation.getAmount());
      if (updatedSenderAccount instanceof Error) {
        const failedOperation = operation.fail();
        await this.operationRepository.update(failedOperation);
        return updatedSenderAccount;
      }

      const updatedReceiverAccount = receiverAccount.deposit(operation.getAmount());

      // Marquer l'opération comme complétée
      const completedOperation = operation.complete();

      // Sauvegarder les modifications
      await this.accountRepository.update(updatedSenderAccount);
      await this.accountRepository.update(updatedReceiverAccount);
      await this.operationRepository.update(completedOperation);

      return completedOperation;
    } catch (error) {
      // En cas d'erreur, marquer l'opération comme échouée
      const failedOperation = operation.fail();
      await this.operationRepository.update(failedOperation);
      return new Error(`Erreur lors de l'exécution du virement: ${error}`);
    }
  }
}
