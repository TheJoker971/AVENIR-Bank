import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity("savings_accounts")
@Index(["iban"], { unique: true })
export class SavingsAccountEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 34, unique: true })
  iban!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: "int" })
  ownerId!: number;

  @Column({ type: "decimal", precision: 5, scale: 4 })
  interestRate!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastInterestCalculation!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}

