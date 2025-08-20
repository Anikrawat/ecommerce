import { drizzle } from 'drizzle-orm/postgres-js'

const dbConnect = () => {
  const db = drizzle(process.env.DATABASE_URL!);
  return db;
}

export default dbConnect;

