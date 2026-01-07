import { OperationEntity } from "domain/entities/OperationEntity";
import { TransferData } from "domain/values/TransferData";
import { Amount } from "domain/values/Amount";
import { Iban } from "domain/values/Iban";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";


export class CreateTransferUseCase {
  private static counter = 0;
  
  constructor(
    private operationRepository: OperationRepositoryInterface,
    private accountRepository: AccountRepositoryInterface
  ) {}

  async execute(
    senderFirstName: string,
    senderLastName: string,
    senderIban: string,
    receiverFirstName: string,
    receiverLastName: string,
    receiverIban: string,
    amount: number,
    reason?: string,
    instantTransfer: boolean = false
  ): Promise<OperationEntity | Error> {
    // Créer les objets de valeur à partir des strings IBAN
    const senderIbanOrError = Iban.fromString(senderIban);

    if (senderIbanOrError instanceof Error) {
      return new Error("IBAN expéditeur invalide");
    }

    const receiverIbanOrError = Iban.fromString(receiverIban);

    if (receiverIbanOrError instanceof Error) {
      return new Error("IBAN destinataire invalide");
    }

    const amountOrError = Amount.create(amount);
    if (amountOrError instanceof Error) {
      return amountOrError;
    }

    // Créer les données de transfert
    const transferDataOrError = TransferData.create(
      senderLastName,
      senderFirstName,
      senderIbanOrError,
      receiverLastName,
      receiverFirstName,
      receiverIbanOrError,
      instantTransfer,
      reason
    );

    if (transferDataOrError instanceof Error) {
      return transferDataOrError;
    }

    // Vérifier que le compte expéditeur existe et a suffisamment de fonds
    const senderAccount = await this.accountRepository.findByIban(senderIbanOrError);
    if (!senderAccount) {
      return new Error("Compte expéditeur non trouvé");
    }

    if (senderAccount.getBalance().isLessThan(amountOrError)) {
      return new Error("Fonds insuffisants sur le compte expéditeur");
    }

    // Note: Le compte destinataire peut ne pas exister (virement externe vers bénéficiaire)
    // La vérification de l'existence du compte destinataire est faite dans le contrôleur si nécessaire

    // Créer l'opération avec un ID unique (Date.now() + compteur pour éviter les collisions)
    const operationId = Date.now() * 1000 + (CreateTransferUseCase.counter++ % 1000);
    console.log(`🆕 Création d'une nouvelle opération avec ID: ${operationId}`);
    
    const operationOrError = OperationEntity.create(
      operationId,
      transferDataOrError,
      amountOrError
    );

    if (operationOrError instanceof Error) {
      return operationOrError;
    }

    // Sauvegarder l'opération
    console.log(`💾 Sauvegarde de l'opération ${operationId}...`);
    await this.operationRepository.save(operationOrError);
    console.log(`✅ Opération ${operationId} sauvegardée avec succès`);

    return operationOrError;
  }
}
