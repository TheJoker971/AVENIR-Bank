/**
 * DTO User pour l'affichage - représentation simple des données depuis l'API
 */
export interface UserDto {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  role: 'CLIENT' | 'ADVISE' | 'DIRECTOR';
  banned: boolean;
}

