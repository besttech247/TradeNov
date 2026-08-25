import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('username:password')) {
    return res.status(400).json({
      status: 'unconfigured',
      message: 'DATABASE_URL غير مهيأ أو يحتوي على القيم الافتراضية. يرجى إضافة رابط Neon في لوحة تحكم Vercel أو ملف .env',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const startTime = Date.now();
    const sql = neon(dbUrl);
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name, version() as db_version`;
    const latency = Date.now() - startTime;

    return res.status(200).json({
      status: 'connected',
      message: 'تم الاتصال بقاعدة بيانات Neon PostgreSQL بنجاح! 🚀',
      database: result[0]?.db_name,
      serverTime: result[0]?.current_time,
      version: result[0]?.db_version,
      latencyMs: latency,
      platform: 'Vercel Serverless Function'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'فشل الاتصال بقاعدة بيانات Neon: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
}
