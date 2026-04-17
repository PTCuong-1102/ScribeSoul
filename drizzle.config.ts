import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';

if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
