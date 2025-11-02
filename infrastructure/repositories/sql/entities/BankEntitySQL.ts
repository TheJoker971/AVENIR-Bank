import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("banks")
export class BankEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 10 })
  bankCode!: string;

  @Column({ type: "varchar", length: 10 })
  branchCode!: string;

  @Column({ type: "decimal", precision: 5, scale: 4, default: 0 })
  interestRate!: number;
}

