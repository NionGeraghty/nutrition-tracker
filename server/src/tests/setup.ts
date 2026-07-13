import { beforeAll, afterEach, afterAll } from 'vitest';
import { pool } from '../db';

beforeAll(async () => {
  await pool.query(
    `INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
    [process.env.DEV_USER_ID, 'test@example.com']
  );
});

afterEach(async () => {
  await pool.query('DELETE FROM food_entries');
  await pool.query('DELETE FROM foods');
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = $1', [process.env.DEV_USER_ID]);
  await pool.end();
});