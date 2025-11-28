import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema  from './schema';

// ⚠️ DATABASE_URL is private (not NEXT_PUBLIC_) - only accessible server-side
const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
export const db = drizzle(sql, { schema });
