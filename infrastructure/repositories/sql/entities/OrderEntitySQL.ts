import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity("orders")
@Index(["clientId"])
@Index(["stockSymbol"])
@Index(["status"])
export class OrderEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 10 })
  stockSymbol!: string;

  @Column({ type: "varchar", length: 10 })
  orderType!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: "varchar", length: 20, default: "PENDING" })
  status!: string;

  @Column({ type: "int" })
  clientId!: number;

  @Column({ type: "timestamp", nullable: true })
  executedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}

