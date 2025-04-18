import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(<string>process.env.DATABASE_URL);