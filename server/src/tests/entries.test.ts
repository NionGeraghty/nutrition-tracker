import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { pool } from '../db';

const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002';

describe('POST /entries', () => {
  it('creates an entry when the food exists', async () => {
    const foodResponse = await request(app).post('/foods').send({
      name: 'Rice',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fibrePer100g: 0.4,
    });

    const foodId = foodResponse.body.id;

    const entryResponse = await request(app).post('/entries').send({
      foodId,
      date: '2026-07-13',
      grams: 150,
    });

    expect(entryResponse.status).toBe(201);
    expect(entryResponse.body.food_id).toBe(foodId);
  });

  it('rejects an entry referencing a food that does not exist', async () => {
    const response = await request(app).post('/entries').send({
      foodId: '00000000-0000-0000-0000-000000000099',
      date: '2026-07-13',
      grams: 150,
    });

    expect(response.status).toBe(400);
  });

  it('rejects invalid entry data', async () => {
    const response = await request(app).post('/entries').send({
      date: '2026-07-13',
      // missing foodId and grams
    });

    expect(response.status).toBe(400);
  });
});

describe('GET /entries', () => {
  it('returns entries for the requested date, joined with food details', async () => {
    const foodResponse = await request(app).post('/foods').send({
      name: 'Oats',
      caloriesPer100g: 389,
      proteinPer100g: 16.9,
      carbsPer100g: 66,
      fatPer100g: 6.9,
      fibrePer100g: 10.6,
    });
    const foodId = foodResponse.body.id;

    await request(app).post('/entries').send({
      foodId,
      date: '2026-07-13',
      grams: 50,
    });

    const response = await request(app).get('/entries?date=2026-07-13');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Oats');
    expect(response.body[0].grams).toBe('50');
  });

  it('returns an empty array for a date with no entries', async () => {
    const response = await request(app).get('/entries?date=2099-01-01');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('user isolation', () => {
  it('does not return another user\'s entries', async () => {
    await pool.query(
      `INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
      [OTHER_USER_ID, 'other@example.com']
    );

    const foodResult = await pool.query(
      `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      ['Other user food', 100, 10, 10, 10, 1, OTHER_USER_ID]
    );
    const otherUsersFoodId = foodResult.rows[0].id;

    await pool.query(
      `INSERT INTO food_entries (food_id, date, grams, user_id)
       VALUES ($1, $2, $3, $4)`,
      [otherUsersFoodId, '2026-07-13', 100, OTHER_USER_ID]
    );

    const response = await request(app).get('/entries?date=2026-07-13');
    expect(response.body).toEqual([]);

    await pool.query('DELETE FROM food_entries WHERE user_id = $1', [OTHER_USER_ID]);
    await pool.query('DELETE FROM foods WHERE user_id = $1', [OTHER_USER_ID]);
    await pool.query('DELETE FROM users WHERE id = $1', [OTHER_USER_ID]);
  });
});