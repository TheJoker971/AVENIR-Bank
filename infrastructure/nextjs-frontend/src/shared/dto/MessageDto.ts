/**
 * DTO Message pour l'affichage
 */
export interface MessageDto {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  date: string;
}

