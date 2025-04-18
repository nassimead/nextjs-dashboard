import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, varchar, int, date, unique } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const customers = mysqlTable("customers", {
	id: varchar({ length: 36 }).default(sql`(uuid())`).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	imageUrl: varchar("image_url", { length: 255 }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "customers_id"}),
]);

export const invoices = mysqlTable("invoices", {
	id: varchar({ length: 36 }).default(sql`(uuid())`).notNull(),
	customerId: varchar("customer_id", { length: 36 }).notNull(),
	amount: int().notNull(),
	status: varchar({ length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "invoices_id"}),
]);

export const migrations = mysqlTable("migrations", {
	id: int({ unsigned: true }).autoincrement().notNull(),
	migration: varchar({ length: 255 }).notNull(),
	batch: int().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "migrations_id"}),
]);

export const revenue = mysqlTable("revenue", {
	month: varchar({ length: 4 }).notNull(),
	revenue: int().notNull(),
},
(table) => [
	unique("month").on(table.month),
]);

export const users = mysqlTable("users", {
	id: varchar({ length: 36 }).default(sql`(uuid())`).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("email").on(table.email),
]);
