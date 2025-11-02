/**
 * Service de gestion des bénéficiaires - Application Layer
 */
import { BeneficiaryDto } from '@/shared/dto';

export interface CreateBeneficiaryData {
  name: string;
  iban: string;
}

export interface BeneficiaryServiceInterface {
  getBeneficiaries(userId: number): Promise<BeneficiaryDto[] | Error>;
  createBeneficiary(data: CreateBeneficiaryData): Promise<BeneficiaryDto | Error>;
  deleteBeneficiary(beneficiaryId: number): Promise<void | Error>;
}

