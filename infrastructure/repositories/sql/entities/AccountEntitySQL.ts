import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity("accounts")
@Index(["iban"], { unique: true })
export class AccountEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20, unique: true })
  accountNumber!: string;

  @Column({ type: "varchar", length: 34, unique: true })
  iban!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: "int" })
  ownerId!: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  accountType?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

