import { OperationEntity } from "domain/entities/OperationEntity";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";

export class ExecuteTransferUseCase {
  constructor(
    private operationRepository: OperationRepositoryInterface,
    private accountRepository: AccountRepositoryInterface
  ) {}

  async execute(operationId: number): Promise<OperationEntity | Error> {
    console.log(`⚡ Exécution de l'opération ${operationId}...`);
    
    // Récupérer l'opération
    const operation = await this.operationRepository.findById(operationId);
    if (!operation) {
      console.error(`❌ Opération ${operationId} non trouvée dans le repository`);
      return new Error("Opération non trouvée");
    }
    
    console.log(`✅ Opération ${operationId} trouvée, statut: ${operation.getStatus()}`);

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

      // Le compte destinataire peut ne pas exister (virement externe)
      const isInternalTransfer = !!receiverAccount;

      // Vérifier à nouveau les fonds (au cas où ils auraient changé)
      if (senderAccount.getBalance().isLessThan(operation.getAmount())) {
        const failedOperation = operation.fail();
        await this.operationRepository.update(failedOperation);
        return new Error("Fonds insuffisants pour exécuter le virement");
      }

      // Effectuer le retrait du compte expéditeur
      const updatedSenderAccount = senderAccount.withdraw(operation.getAmount());
      if (updatedSenderAccount instanceof Error) {
        const failedOperation = operation.fail();
        await this.operationRepository.update(failedOperation);
        return updatedSenderAccount;
      }

      // Si c'est un virement interne, créditer le compte destinataire
      if (isInternalTransfer && receiverAccount) {
        const updatedReceiverAccount = receiverAccount.deposit(operation.getAmount());
        await this.accountRepository.update(updatedReceiverAccount);
      }

      // Marquer l'opération comme complétée
      const completedOperation = operation.complete();
      console.log(`✅ Opération ${operationId} marquée comme COMPLETED`);

      // Sauvegarder les modifications
      await this.accountRepository.update(updatedSenderAccount);
      console.log(`💰 Compte émetteur mis à jour`);
      
      await this.operationRepository.update(completedOperation);
      console.log(`💾 Opération ${operationId} mise à jour dans le repository`);

      return completedOperation;
    } catch (error) {
      // En cas d'erreur, marquer l'opération comme échouée
      const failedOperation = operation.fail();
      await this.operationRepository.update(failedOperation);
      return new Error(`Erreur lors de l'exécution du virement: ${error}`);
    }
  }
}
