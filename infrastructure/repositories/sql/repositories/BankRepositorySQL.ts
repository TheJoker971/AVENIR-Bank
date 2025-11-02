import { Repository, DataSource } from "typeorm";
import { BankRepositoryInterface } from "application/repositories/BankRepositoryInterface";
import { BankEntity } from "domain/entities/BankEntity";
import { BankEntitySQL } from "../entities/BankEntitySQL";
import { BankCode } from "domain/values/BankCode";
import { BranchCode } from "domain/values/BranchCode";
import { InterestRate } from "domain/values/InterestRate";

export class BankRepositorySQL implements BankRepositoryInterface {
  private repository: Repository<BankEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(BankEntitySQL);
  }

  async getCurrentBank(): Promise<BankEntity | null> {
    // On suppose qu'il n'y a qu'une seule banque dans le système
    const sqlEntity = await this.repository.findOne({ order: { id: "ASC" } });
    if (!sqlEntity) return null;
    
    return this.toDomain(sqlEntity);
  }

  async findById(id: number): Promise<BankEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return this.toDomain(sqlEntity);
  }

  async save(bank: BankEntity): Promise<void | Error> {
    const sqlEntity = this.toSQL(bank);
    await this.repository.save(sqlEntity);
  }

  async update(bank: BankEntity): Promise<void | Error> {
    const sqlEntity = this.toSQL(bank);
    // Note: BankEntity n'a pas d'ID direct, on met à jour la première banque
    const existing = await this.repository.findOne({ order: { id: "ASC" } });
    if (existing) {
      await this.repository.update({ id: existing.id }, sqlEntity);
    } else {
      await this.repository.save(sqlEntity);
    }
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  private toDomain(sqlEntity: BankEntitySQL): BankEntity {
    const bankCode = BankCode.create(sqlEntity.bankCode);
    if (bankCode instanceof Error) throw new Error("Invalid bank code");
    
    const branchCode = BranchCode.create(sqlEntity.branchCode);
    if (branchCode instanceof Error) throw new Error("Invalid branch code");

    const interestRate = InterestRate.create(sqlEntity.interestRate);
    if (interestRate instanceof Error) throw new Error("Invalid interest rate");

    const bank = BankEntity.create(sqlEntity.name, sqlEntity.bankCode, sqlEntity.branchCode);
    if (bank instanceof Error) throw bank;

    // Mettre à jour le taux d'intérêt
    return bank.updateInterestRate(interestRate);
  }

  private toSQL(domainEntity: BankEntity): BankEntitySQL {
    const sqlEntity = new BankEntitySQL();
    sqlEntity.name = domainEntity.name;
    sqlEntity.bankCode = domainEntity.bankCode.value;
    sqlEntity.branchCode = domainEntity.branche.value;
    sqlEntity.interestRate = domainEntity.interestRate.value;
    return sqlEntity;
  }
}

