import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Set search path for neurocare schema after connection
pool.on('connect', async (client) => {
  try {
    await client.query('SET search_path TO neurocare, public');
  } catch (err) {
    console.error('Error setting search_path:', err);
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
