// database/connect.ts
// import postgres from 'postgres';

// const sql = postgres('postgres://username:password@host:port/database', {
//   host: process.env.NEXT_PUBLIC_DB_HOST,
//   port: parseInt(process.env.NEXT_PUBLIC_DB_PORT || '5432'),
//   database: process.env.NEXT_PUBLIC_DB_NAME,
//   username: process.env.NEXT_PUBLIC_DB_USER,
//   password: process.env.NEXT_PUBLIC_DB_PASSWORD,
//   ssl: false, 
// });

// export default sql;
"use server";
import { neon } from "@neondatabase/serverless";
  const sql = neon(process.env.DATABASE_URL!);
export default sql;