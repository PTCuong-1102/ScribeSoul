import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DB = ReturnType<typeof drizzle<typeof schema>>

let _db: DB | null = null

export function getDb(): DB {
  if (_db) return _db

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required. Please set it in .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);
  _db = drizzle(sql, { schema });
  return _db
}

// Proxy for backward compatibility — `db.query.xxx` works seamlessly
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    return getDb()[prop as keyof DB]
  },
})
