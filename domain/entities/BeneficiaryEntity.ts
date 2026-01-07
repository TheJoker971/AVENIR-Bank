/**
 * Entité Bénéficiaire - Domain Layer
 * Représente un bénéficiaire qu'un client peut ajouter pour effectuer des virements
 */
export class BeneficiaryEntity {
  private constructor(
    public readonly id: number,
    public readonly ownerId: number, // ID du client propriétaire
    public readonly name: string, // Nom complet du bénéficiaire
    public readonly iban: string, // IBAN du compte bénéficiaire
    public readonly createdAt: Date = new Date()
  ) {}

  public static create(
    id: number,
    ownerId: number,
    name: string,
    iban: string
  ): BeneficiaryEntity | Error {
    if (!name || name.trim().length === 0) {
      return new Error("Le nom du bénéficiaire est requis");
    }

    if (!iban || iban.trim().length === 0) {
      return new Error("L'IBAN est requis");
    }

    // Validation basique de l'IBAN (format français FR + 23 caractères)
    const ibanRegex = /^FR[0-9A-Z]{25}$/;
    if (!ibanRegex.test(iban.replace(/\s/g, ''))) {
      return new Error("Format IBAN invalide");
    }

    return new BeneficiaryEntity(
      id,
      ownerId,
      name.trim(),
      iban.replace(/\s/g, '').toUpperCase()
    );
  }

  public getName(): string {
    return this.name;
  }

  public getIban(): string {
    return this.iban;
  }

  public getOwnerId(): number {
    return this.ownerId;
  }
}

