import { Repository, DataSource } from "typeorm";
import { AccountRepositoryInterface, SavingsAccountRepositoryInterface } from "application/repositories/AccountRepositoryInterface";
import { AccountEntity } from "domain/entities/AccountEntity";
import { SavingsAccountEntity } from "domain/entities/SavingsAccountEntity";
import { AccountEntitySQL } from "../entities/AccountEntitySQL";
import { SavingsAccountEntitySQL } from "../entities/SavingsAccountEntitySQL";
import { AccountMapper, SavingsAccountMapper } from "../mappers/AccountMapper";
import { Iban } from "domain/values/Iban";

export class AccountRepositorySQL implements AccountRepositoryInterface {
  private repository: Repository<AccountEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(AccountEntitySQL);
  }

  async findById(id: number): Promise<AccountEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return AccountMapper.toDomain(sqlEntity);
  }

  async findByIban(iban: Iban): Promise<AccountEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { iban: iban.value } });
    if (!sqlEntity) return null;
    return AccountMapper.toDomain(sqlEntity);
  }

  async findByOwnerId(ownerId: number): Promise<AccountEntity[]> {
    const sqlEntities = await this.repository.find({ where: { ownerId } });
    return sqlEntities.map(entity => AccountMapper.toDomain(entity)).filter((e): e is AccountEntity => e !== null);
  }

  async findAll(): Promise<AccountEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => AccountMapper.toDomain(entity)).filter((e): e is AccountEntity => e !== null);
  }

  async save(account: AccountEntity): Promise<void> {
    const sqlEntity = AccountMapper.toSQL(account);
    await this.repository.save(sqlEntity);
  }

  async update(account: AccountEntity): Promise<void> {
    const sqlEntity = AccountMapper.toSQL(account);
    // Note: AccountEntity n'a pas d'ID, on utilise l'IBAN comme clé
    await this.repository.update({ iban: account.iban.value }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async findByOwnerIdAndType(ownerId: number, accountType: string): Promise<AccountEntity[]> {
    const sqlEntities = await this.repository.find({ 
      where: { 
        ownerId,
        accountType: accountType || undefined
      } 
    });
    return sqlEntities.map(entity => AccountMapper.toDomain(entity)).filter((e): e is AccountEntity => e !== null);
  }
}

export class SavingsAccountRepositorySQL implements SavingsAccountRepositoryInterface {
  private repository: Repository<SavingsAccountEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(SavingsAccountEntitySQL);
  }

  async findById(id: number): Promise<SavingsAccountEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return SavingsAccountMapper.toDomain(sqlEntity);
  }

  async findByIban(iban: Iban): Promise<SavingsAccountEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { iban: iban.value } });
    if (!sqlEntity) return null;
    return SavingsAccountMapper.toDomain(sqlEntity);
  }

  async findByOwnerId(ownerId: number): Promise<SavingsAccountEntity[]> {
    const sqlEntities = await this.repository.find({ where: { ownerId } });
    return sqlEntities.map(entity => SavingsAccountMapper.toDomain(entity)).filter((e): e is SavingsAccountEntity => e !== null);
  }

  async findAll(): Promise<SavingsAccountEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => SavingsAccountMapper.toDomain(entity)).filter((e): e is SavingsAccountEntity => e !== null);
  }

  async save(savingsAccount: SavingsAccountEntity): Promise<void> {
    const sqlEntity = SavingsAccountMapper.toSQL(savingsAccount);
    await this.repository.save(sqlEntity);
  }

  async update(savingsAccount: SavingsAccountEntity): Promise<void> {
    const sqlEntity = SavingsAccountMapper.toSQL(savingsAccount);
    await this.repository.update({ id: savingsAccount.id }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async findAllForInterestCalculation(): Promise<SavingsAccountEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => SavingsAccountMapper.toDomain(entity)).filter((e): e is SavingsAccountEntity => e !== null);
  }

  async findByInterestRate(interestRate: number): Promise<SavingsAccountEntity[]> {
    const sqlEntities = await this.repository.find({ where: { interestRate } });
    return sqlEntities.map(entity => SavingsAccountMapper.toDomain(entity)).filter((e): e is SavingsAccountEntity => e !== null);
  }
}

