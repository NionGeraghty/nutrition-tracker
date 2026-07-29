import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { pool } from '../db';

describe('GET /summary', () => {
  it('returns 400 if date query parameter is missing', async () => {
    const response = await request(app).get('/summary');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('A date query parameter is required');
  });

  it('returns zeroed totals when there are no entries for the date', async () => {
    const response = await request(app).get('/summary').query({ date: '2099-01-01' });

    expect(response.status).toBe(200);
    expect(response.body.totals).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fibre: 0,
    });
  });

  it('returns null goals and remaining when no goals are set', async () => {
    const response = await request(app).get('/summary').query({ date: '2024-06-01' });

    expect(response.status).toBe(200);
    expect(response.body.goals).toBeNull();
    expect(response.body.remaining).toBeNull();
  });

  it('returns correct totals, goals, and remaining when entries and goals exist', async () => {
    const foodResult = await pool.query(
      `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      ['Test Food', 200, 10, 30, 5, 2, process.env.DEV_USER_ID]
    );
    const foodId = foodResult.rows[0].id;

    await pool.query(
      `INSERT INTO food_entries (user_id, food_id, grams, date)
       VALUES ($1, $2, $3, $4)`,
      [process.env.DEV_USER_ID, foodId, 150, '2024-06-01']
    );

    await pool.query(
      `INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fibre)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [process.env.DEV_USER_ID, 2000, 150, 200, 65, 30]
    );

    const response = await request(app).get('/summary').query({ date: '2024-06-01' });

    expect(response.status).toBe(200);
    expect(response.body.totals.calories).toBeCloseTo(300);
    expect(response.body.totals.protein).toBeCloseTo(15);
    expect(response.body.goals.calories).toBe(2000);
    expect(response.body.remaining.calories).toBeCloseTo(1700);
    expect(response.body.remaining.protein).toBeCloseTo(135);
  });

  it('sums multiple entries on the same date correctly', async () => {
    const foodResult = await pool.query(
      `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      ['Test Food', 100, 10, 10, 10, 1, process.env.DEV_USER_ID]
    );
    const foodId = foodResult.rows[0].id;

    await pool.query(
      `INSERT INTO food_entries (user_id, food_id, grams, date) VALUES ($1, $2, $3, $4)`,
      [process.env.DEV_USER_ID, foodId, 100, '2024-06-01']
    );
    await pool.query(
      `INSERT INTO food_entries (user_id, food_id, grams, date) VALUES ($1, $2, $3, $4)`,
      [process.env.DEV_USER_ID, foodId, 50, '2024-06-01']
    );

    const response = await request(app).get('/summary').query({ date: '2024-06-01' });

    expect(response.body.totals.calories).toBeCloseTo(150);
  });
});