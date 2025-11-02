import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity("operations")
@Index(["senderIban"])
@Index(["receiverIban"])
@Index(["status"])
export class OperationEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 34 })
  senderIban!: string;

  @Column({ type: "varchar", length: 100 })
  senderFirstName!: string;

  @Column({ type: "varchar", length: 100 })
  senderLastName!: string;

  @Column({ type: "varchar", length: 34 })
  receiverIban!: string;

  @Column({ type: "varchar", length: 100 })
  receiverFirstName!: string;

  @Column({ type: "varchar", length: 100 })
  receiverLastName!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: "varchar", length: 20, default: "PENDING" })
  status!: string;

  @Column({ type: "boolean", default: false })
  isInstant!: boolean;

  @Column({ type: "text", nullable: true })
  reason?: string;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  date!: Date;
}

