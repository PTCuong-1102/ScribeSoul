import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setup() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log("Enabling pgvector extension...");
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log("✅ Extension enabled successfully.");
  } catch (e) {
    console.error("❌ Error enabling extension:", e);
    console.log("Please enable it manually in Neon Console -> SQL Editor: CREATE EXTENSION IF NOT EXISTS vector;");
  }
}

setup();
