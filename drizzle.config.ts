import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env.local",
});

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./lib/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_MgcRTN5Wu2IF@ep-bitter-brook-a1cukrfv.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
});
