import { relations } from "drizzle-orm/relations";
import { invoices, customers } from "./schema";

export const invoiceRelations = relations(invoices, ({ one }) => ({
	customer: one(customers, {
		fields: [invoices.customer_id],
		references: [customers.id],
	}),
}));

