import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity("messages")
@Index(["senderId"])
@Index(["receiverId"])
export class MessageEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  senderId!: number;

  @Column({ type: "int", nullable: true })
  receiverId?: number;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "int", nullable: true })
  assignedAdvisorId?: number;

  @CreateDateColumn()
  date!: Date;
}

