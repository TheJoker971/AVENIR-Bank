import { DataSource } from "typeorm";
import { UserEntitySQL } from "../entities/UserEntitySQL";
import { AccountEntitySQL } from "../entities/AccountEntitySQL";
import { SavingsAccountEntitySQL } from "../entities/SavingsAccountEntitySQL";
import { BankEntitySQL } from "../entities/BankEntitySQL";
import { OperationEntitySQL } from "../entities/OperationEntitySQL";
import { StockEntitySQL } from "../entities/StockEntitySQL";
import { OrderEntitySQL } from "../entities/OrderEntitySQL";
import { CreditEntitySQL } from "../entities/CreditEntitySQL";
import { MessageEntitySQL } from "../entities/MessageEntitySQL";
import { NotificationEntitySQL } from "../entities/NotificationEntitySQL";

export const AppDataSource = new DataSource({
  type: "postgres", // ou "mysql", "sqlite", etc.
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "avenir_bank",
  synchronize: process.env.NODE_ENV !== "production", // Ne jamais utiliser en production
  logging: process.env.NODE_ENV === "development",
  entities: [
    UserEntitySQL,
    AccountEntitySQL,
    SavingsAccountEntitySQL,
    BankEntitySQL,
    OperationEntitySQL,
    StockEntitySQL,
    OrderEntitySQL,
    CreditEntitySQL,
    MessageEntitySQL,
    NotificationEntitySQL
  ],
  migrations: ["infrastructure/repositories/sql/migrations/*.ts"],
  subscribers: ["infrastructure/repositories/sql/subscribers/*.ts"]
});

// Alternative pour MySQL
export const MySQLDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "avenir_bank",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  entities: [
    UserEntitySQL,
    AccountEntitySQL,
    SavingsAccountEntitySQL,
    BankEntitySQL,
    OperationEntitySQL,
    StockEntitySQL,
    OrderEntitySQL,
    CreditEntitySQL,
    MessageEntitySQL,
    NotificationEntitySQL
  ],
  migrations: ["infrastructure/repositories/sql/migrations/*.ts"],
  subscribers: ["infrastructure/repositories/sql/subscribers/*.ts"]
});

