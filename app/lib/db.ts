import { RowDataPacket } from 'mysql2';
import mysql from 'mysql2/promise';
import { cache } from 'react';

const pool = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(<string>process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

async function sqlNonCache(query: string, values?: Array<unknown>): Promise<RowDataPacket[]> {
    const [res] = await pool.execute<RowDataPacket[]>(query, values);
    return res;
}

const sql = cache(sqlNonCache);

export default sql;