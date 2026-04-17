import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL || "postgresql://db_user:db_pass@ep-placeholder-1234.us-east-1.aws.neon.tech/neondb?sslmode=require");
export const db = drizzle(sql, { schema });
