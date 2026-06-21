import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MySQL connection pool configuration.
 * Uses connection pooling for efficient resource management —
 * connections are reused rather than created/destroyed per request.
 */
const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'requip_users',
  waitForConnections: true,
  connectionLimit: 10,        // Max simultaneous connections
  queueLimit: 0,              // Unlimited queue (0 = no limit)
  enableKeepAlive: true,      // Keep TCP connections alive
  keepAliveInitialDelay: 0,   // Immediately start keep-alive
});

export default pool;
