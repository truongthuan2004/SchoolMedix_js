import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// 🔧 Lấy đường dẫn file hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env ở thư mục gốc
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

const pool = new Pool({
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), 
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

console.log('ENV:', process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_HOST, process.env.DB_PORT, process.env.DB_NAME);

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ PostgreSQL error:', err.message);
    console.error('👉 Full error:', err);
    console.log('\n🛠️ Connection config used:');
    console.log({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });
  } finally {
    pool.end();
  }
})();

export default pool;
