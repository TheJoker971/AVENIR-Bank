import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("users")
export class UserEntitySQL {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  firstname!: string;

  @Column({ type: "varchar", length: 100 })
  lastname!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "text" })
  address!: string;

  @Column({ type: "varchar", length: 20 })
  role!: string;

  @Column({ type: "boolean", default: false })
  banned!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

