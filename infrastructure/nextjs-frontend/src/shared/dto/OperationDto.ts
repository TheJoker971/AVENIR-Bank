/**
 * DTO Operation pour l'affichage
 */
export interface OperationDto {
  id: number;
  data: {
    senderIban: string;
    receiverIban: string;
    senderName: string;
    receiverName: string;
    reason?: string;
    isInstantTransfer: boolean;
  };
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  completedAt?: string;
}

