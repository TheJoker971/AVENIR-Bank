import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity("credits")
@Index(["clientId"])
@Index(["status"])
export class CreditEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  clientId!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  principalAmount!: number;

  @Column({ type: "decimal", precision: 5, scale: 4 })
  annualInterestRate!: number;

  @Column({ type: "decimal", precision: 5, scale: 4 })
  insuranceRate!: number;

  @Column({ type: "int" })
  termMonths!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  monthlyPayment!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  remainingBalance!: number;

  @Column({ type: "varchar", length: 20, default: "ACTIVE" })
  status!: string;

  @Column({ type: "timestamp" })
  nextPaymentDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}

