
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { users, revenue, customers, invoices } from '@/app/db/schema';

import { invoicesData, customersData, revenueData, usersData } from '../lib/placeholder-data';

const db = drizzle(<string>process.env.DATABASE_URL);

async function seedUsers() {
  return await db.insert(users).values(usersData);
}

async function seedInvoices() {
  return await db.insert(invoices).values(invoicesData);
}

async function seedCustomers() {
  return await db.insert(customers).values(customersData);
}

async function seedRevenue() {
  return await db.insert(revenue).values(revenueData);
}

export async function GET() {
  try {
    await Promise.all([
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue()
    ]);
    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
