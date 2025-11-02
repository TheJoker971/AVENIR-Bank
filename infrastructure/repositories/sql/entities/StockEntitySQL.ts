import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity("stocks")
@Index(["symbol"], { unique: true })
export class StockEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 10, unique: true })
  symbol!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  currentPrice!: number;

  @Column({ type: "int" })
  totalShares!: number;

  @Column({ type: "int" })
  availableShares!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

