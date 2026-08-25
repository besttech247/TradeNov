import { neon } from '@neondatabase/serverless';

/**
 * عميل قاعدة بيانات Neon PostgreSQL السيرفرلس
 * يتم استخدام connection pooling التلقائي عبر WebSockets/HTTP للعمل فائق السرعة على Vercel
 */
export function getDbClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }
  return neon(connectionString);
}

/**
 * دالة مساعدة لتنفيذ استعلام مباشر
 */
export async function query(queryText, params = []) {
  const sql = getDbClient();
  return await sql(queryText, params);
}
