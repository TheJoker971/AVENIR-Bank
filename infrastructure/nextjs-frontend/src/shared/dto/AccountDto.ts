/**
 * DTO Account pour l'affichage
 */
export interface AccountDto {
  id: number;
  accountNumber: string;
  iban: string;
  balance: number;
  ownerId: number;
  createdAt: string;
}

