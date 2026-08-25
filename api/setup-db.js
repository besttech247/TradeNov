import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('username:password')) {
    return res.status(400).json({ status: 'error', message: 'DATABASE_URL غير مهيأ' });
  }

  try {
    const sql = neon(dbUrl);

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        exchange VARCHAR(50) NOT NULL,
        api_key TEXT NOT NULL,
        api_secret TEXT NOT NULL,
        passphrase TEXT,
        is_demo BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(30) NOT NULL,
        side VARCHAR(10) NOT NULL,
        order_type VARCHAR(20) NOT NULL,
        price NUMERIC(18, 8) NOT NULL,
        amount NUMERIC(18, 8) NOT NULL,
        cost NUMERIC(18, 8) NOT NULL,
        status VARCHAR(20) DEFAULT 'FILLED',
        exchange VARCHAR(50) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(30) NOT NULL,
        target_buy NUMERIC(18, 8),
        target_sell NUMERIC(18, 8),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return res.status(200).json({
      status: 'success',
      message: 'تم إنشاء وتهيئة كافة جداول قاعدة البيانات (users, api_keys, trades, watchlist) بنجاح!'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء إنشاء الجداول: ' + error.message
    });
  }
}
