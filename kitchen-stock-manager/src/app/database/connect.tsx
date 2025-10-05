// export default sql;
"use server";
import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL!;

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export default connectToDatabase;
