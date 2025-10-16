import { OperationEntity } from "domain/entities/OperationEntity";
import { TransferData } from "domain/values/TransferData";
import { Amount } from "domain/values/Amount";
import { Iban } from "domain/values/Iban";
import { OperationRepositoryInterface } from "application/repositories/OperationRepositoryInterface";
import { AccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";


export class CreateTransferUseCase {
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
    // Créer les objets de valeur
    const senderIbanOrError = Iban.create(
      { value: "FR" } as any, // CountryCode temporaire
      { value: senderIban.substring(4, 8) } as any, // BankCode temporaire
      { value: senderIban.substring(8, 12) } as any, // BranchCode temporaire
      { value: senderIban.substring(12, 23) } as any, // AccountNumber temporaire
      { value: senderIban.substring(23) } as any // RibKey temporaire
    );

    if (senderIbanOrError instanceof Error) {
      return new Error("IBAN expéditeur invalide");
    }

    const receiverIbanOrError = Iban.create(
      { value: "FR" } as any,
      { value: receiverIban.substring(4, 8) } as any,
      { value: receiverIban.substring(8, 12) } as any,
      { value: receiverIban.substring(12, 23) } as any,
      { value: receiverIban.substring(23) } as any
    );

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

    // Vérifier que le compte destinataire existe
    const receiverAccount = await this.accountRepository.findByIban(receiverIbanOrError);
    if (!receiverAccount) {
      return new Error("Compte destinataire non trouvé");
    }

    // Créer l'opération
    const operationId = Date.now(); // ID temporaire
    const operationOrError = OperationEntity.create(
      operationId,
      transferDataOrError,
      amountOrError
    );

    if (operationOrError instanceof Error) {
      return operationOrError;
    }

    // Sauvegarder l'opération
    await this.operationRepository.save(operationOrError);

    return operationOrError;
  }
}
