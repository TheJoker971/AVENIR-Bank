import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity("notifications")
@Index(["recipientId"])
@Index(["isRead"])
export class NotificationEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  recipientId!: number;

  @Column({ type: "varchar", length: 255 })
  recipientEmail!: string;

  @Column({ type: "varchar", length: 50 })
  type!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "boolean", default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

