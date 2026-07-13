import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { pool } from '../db';

const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002';

describe('GET /foods', () => {
  it('returns an empty array when there are no foods', async () => {
    const response = await request(app).get('/foods');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('POST /foods', () => {
  it('creates a food and returns it with a generated id', async () => {
    const response = await request(app).post('/foods').send({
      name: 'Rice',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fibrePer100g: 0.4,
    });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Rice');
    expect(response.body.id).toBeDefined();
  });

  it('rejects invalid food data with 400', async () => {
    const response = await request(app).post('/foods').send({
      name: 'Rice',
      // missing required fields
    });

    expect(response.status).toBe(400);
  });
});

describe('GET /foods/:id', () => {
  it('returns 404 for a food that does not exist', async () => {
    const response = await request(app).get('/foods/00000000-0000-0000-0000-000000000099');
    expect(response.status).toBe(404);
  });
});

describe('user isolation', () => {
  it('does not return another user\'s food', async () => {
    await pool.query(
      `INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
      [OTHER_USER_ID, 'other@example.com']
    );

    const insertResult = await pool.query(
      `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      ['Secret food', 100, 10, 10, 10, 1, OTHER_USER_ID]
    );

    const otherUsersFoodId = insertResult.rows[0].id;

    const getResponse = await request(app).get(`/foods/${otherUsersFoodId}`);
    expect(getResponse.status).toBe(404);

    const listResponse = await request(app).get('/foods');
    expect(listResponse.body).toEqual([]);

    await pool.query('DELETE FROM foods WHERE user_id = $1', [OTHER_USER_ID]);
    await pool.query('DELETE FROM users WHERE id = $1', [OTHER_USER_ID]);
  });
});