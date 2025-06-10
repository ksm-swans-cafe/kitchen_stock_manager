import postgres from "postgres";

const sql = postgres({
  host: process.env.NEXT_PUBLIC_DB_HOST,
  port: parseInt(process.env.NEXT_PUBLIC_DB_PORT || "5432"),
  database: process.env.NEXT_PUBLIC_DB_NAME,
  username: process.env.NEXT_PUBLIC_DB_USER,
  password: process.env.NEXT_PUBLIC_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Adjust based on your SSL requirements
  },
});

export default sql;