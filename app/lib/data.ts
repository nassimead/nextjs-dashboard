import { formatCurrency } from './utils';
import { Customer, Invoice, LatestInvoice, Revenue } from './definitions';

import { drizzle } from 'drizzle-orm/mysql2';
import { eq, desc, sum, or, like, count, asc } from 'drizzle-orm';
import { customers, invoices, revenue } from '@/app/db/schema';

const db = drizzle(<string>process.env.DATABASE_URL);

export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await db.select().from(revenue);

    //const data = <Revenue[]>await sql('SELECT * FROM revenue');

    // console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices(): Promise<LatestInvoice[]> {
  try {

    const data = await db.select({
      amount: invoices.amount,
      name: customers.name,
      image_url: customers.image_url,
      email: customers.email,
      id: invoices.id
    }).from(invoices).leftJoin(customers, eq(invoices.customer_id, customers.id)).orderBy(desc(invoices.date)).limit(5);
    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return <LatestInvoice[]>latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    //const invoiceCountPromise = sql('SELECT COUNT(*) as count FROM invoices');
    const invoiceCount = await db.$count(invoices);

    // const customerCountPromise = sql('SELECT COUNT(*) as count FROM customers');
    const customerCount = await db.$count(customers);

    const invoicePaid = await db.select({
      value: sum(invoices.amount)
    }).from(invoices).where(eq(invoices.status, 'paid'));

    const invoicePending = await db.select({
      value: sum(invoices.amount)
    }).from(invoices).where(eq(invoices.status, 'pending'));

    const data = await Promise.all([
      invoiceCount,
      customerCount,
      invoicePaid,
      invoicePending
    ]);

    const numberOfInvoices = Number(data[0] ?? '0');
    const numberOfCustomers = Number(data[1] ?? '0');
    const totalPaidInvoices = formatCurrency(parseInt(data[2][0].value ?? '0'));
    const totalPendingInvoices = formatCurrency(parseInt(data[3][0].value ?? '0'));

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    query = query.toLocaleLowerCase();
    return await db.select({
      id: invoices.id,
      amount: invoices.amount,
      date: invoices.date,
      status: invoices.status,
      name: customers.name,
      email: customers.email,
      image_url: customers.image_url
    }).from(invoices).leftJoin(customers, eq(invoices.customer_id, customers.id)).where(
      or(
        like(customers.name, `%${query}%`),
        like(customers.email, `%${query}%`),
        like(invoices.amount, `%${query}%`),
        like(invoices.date, `%${query}%`),
        like(invoices.status, `%${query}%`),
      ),
    ).orderBy(desc(invoices.date)).limit(ITEMS_PER_PAGE).offset(offset);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    query = query.toLowerCase();
    const data = await db.select({ count: count() }).from(invoices).leftJoin(customers, eq(invoices.customer_id, customers.id)).where(
      or(
        like(customers.name, `%${query}%`),
        like(customers.email, `%${query}%`),
        like(invoices.amount, `%${query}%`),
        like(invoices.date, `%${query}%`),
        like(invoices.status, `%${query}%`),
      ),
    );
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string): Promise<Invoice> {
  try {

    const data = await db.select({
      id: invoices.id,
      customer_id: invoices.customer_id,
      amount: invoices.amount,
      date: invoices.date,
      status: invoices.status
    }).from(invoices).where(eq(invoices.id, id)).limit(1);

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }))
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    return await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      image_url: customers.image_url
    }).from(customers).orderBy(asc(customers.name));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    query = query.toLocaleLowerCase();

    const data = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      image_url: customers.image_url
    }).from(customers).leftJoin(invoices, eq(customers.id, invoices.customer_id)).where(
      or(
        like(customers.name, `%${query}%`),
        like(customers.email, `%${query}%`),
      ),
    ).orderBy(asc(customers.name));
    const custs = data.map((customer) => ({
      ...customer,
      // total_pending: formatCurrency(customer.total_pending),
      // total_paid: formatCurrency(customer.total_paid),
    }));

    return custs;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
