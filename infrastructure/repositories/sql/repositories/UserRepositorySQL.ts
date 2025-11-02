import { Repository, DataSource } from "typeorm";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { UserEntity } from "domain/entities/UserEntity";
import { UserEntitySQL } from "../entities/UserEntitySQL";
import { UserMapper } from "../mappers/UserMapper";

export class UserRepositorySQL implements UserRepositoryInterface {
  private repository: Repository<UserEntitySQL>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserEntitySQL);
  }

  async findById(id: number): Promise<UserEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { id } });
    if (!sqlEntity) return null;
    return UserMapper.toDomain(sqlEntity);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const sqlEntity = await this.repository.findOne({ where: { email } });
    if (!sqlEntity) return null;
    return UserMapper.toDomain(sqlEntity);
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    const sqlEntities = await this.repository.find({ where: { role } });
    return sqlEntities.map(entity => UserMapper.toDomain(entity));
  }

  async findAll(): Promise<UserEntity[]> {
    const sqlEntities = await this.repository.find();
    return sqlEntities.map(entity => UserMapper.toDomain(entity));
  }

  async save(user: UserEntity): Promise<void> {
    const sqlEntity = UserMapper.toSQL(user);
    await this.repository.save(sqlEntity);
  }

  async update(user: UserEntity): Promise<void> {
    const sqlEntity = UserMapper.toSQL(user);
    await this.repository.update({ id: user.id }, sqlEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}

