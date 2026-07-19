import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { pool } from '../db';

describe('GET /goals', () => {
  it('returns 404 when no goals have been set', async () => {
    const response = await request(app).get('/goals');
    expect(response.status).toBe(404);
  });
});

describe('PUT /goals', () => {
  it('creates goals on first call', async () => {
    const response = await request(app).put('/goals').send({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
      fibre: 30,
    });

    expect(response.status).toBe(200);
    expect(response.body.calories).toBe('2000');
  });

  it('rejects invalid goal data', async () => {
    const response = await request(app).put('/goals').send({
      calories: 2000,
      // missing protein, carbs, fat, fibre
    });

    expect(response.status).toBe(400);
  });

  it('updates existing goals instead of creating a duplicate row', async () => {
    await request(app).put('/goals').send({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
      fibre: 30,
    });

    await request(app).put('/goals').send({
      calories: 1800,
      protein: 140,
      carbs: 180,
      fat: 60,
      fibre: 28,
    });

    const getResponse = await request(app).get('/goals');
    expect(getResponse.body.calories).toBe('1800');

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM daily_goals WHERE user_id = $1',
      [process.env.DEV_USER_ID]
    );
    expect(countResult.rows[0].count).toBe('1');
  });
});