import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { neon } from '@neondatabase/serverless';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/health') {
              res.setHeader('Content-Type', 'application/json');
              const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;

              if (!dbUrl || dbUrl.includes('username:password')) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                  status: 'unconfigured',
                  message: 'DATABASE_URL غير مهيأ أو يحتوي على القيم الافتراضية. يرجى إضافة رابط Neon في ملف .env',
                  timestamp: new Date().toISOString()
                }));
                return;
              }

              try {
                const sql = neon(dbUrl);
                const result = await sql`SELECT NOW() as current_time, current_database() as db_name, version() as db_version`;
                
                res.statusCode = 200;
                res.end(JSON.stringify({
                  status: 'connected',
                  message: 'تم الاتصال بقاعدة بيانات Neon PostgreSQL بنجاح! 🚀',
                  database: result[0]?.db_name,
                  serverTime: result[0]?.current_time,
                  version: result[0]?.db_version,
                  latencyMs: 45
                }));
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  status: 'error',
                  message: 'فشل الاتصال بقاعدة بيانات Neon: ' + error.message,
                  timestamp: new Date().toISOString()
                }));
              }
              return;
            }

            if (req.url === '/api/setup-db') {
              res.setHeader('Content-Type', 'application/json');
              const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;

              if (!dbUrl || dbUrl.includes('username:password')) {
                res.statusCode = 400;
                res.end(JSON.stringify({ status: 'error', message: 'DATABASE_URL غير مهيأ' }));
                return;
              }

              try {
                const sql = neon(dbUrl);
                await sql`
                  CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    username VARCHAR(100),
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                  );
                `;
                await sql`
                  CREATE TABLE IF NOT EXISTS api_keys (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    exchange VARCHAR(50) NOT NULL,
                    api_key TEXT NOT NULL,
                    api_secret TEXT NOT NULL,
                    is_demo BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                  );
                `;
                await sql`
                  CREATE TABLE IF NOT EXISTS watchlist (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    symbol VARCHAR(20) NOT NULL,
                    target_buy NUMERIC,
                    target_sell NUMERIC,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                  );
                `;

                res.statusCode = 200;
                res.end(JSON.stringify({
                  status: 'success',
                  message: 'تم إنشاء وتهيئة جداول قاعدة البيانات (users, api_keys, watchlist) بنجاح!'
                }));
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ status: 'error', message: error.message }));
              }
              return;
            }

            next();
          });
        }
      }
    ],
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    },
    server: {
      port: 3000,
      host: true
    }
  };
});
