/**
 * DTO Operation pour l'affichage
 */
export interface OperationDto {
  id: number;
  type: 'TRANSFER';
  transferData: {
    senderLastName: string;
    senderFirstName: string;
    senderIban: string;
    receiverLastName: string;
    receiverFirstName: string;
    receiverIban: string;
    instantTransfer: boolean;
    reason?: string;
  };
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  completedAt?: string | null;
}

