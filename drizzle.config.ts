import { defineConfig } from "drizzle-kit";
 
export default defineConfig({
  schema: "./app/utils/schema.ts",
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_wbjXv2nHhtM7@ep-withered-glade-ahsn5skc-pooler.c-3.us-east-1.aws.neon.tech/AI-mock-interview?sslmode=require&channel_binding=require',
  }
});

