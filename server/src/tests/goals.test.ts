import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { pool } from '../db';
import { createAndLoginUser } from './helpers';

describe('GET /goals', () => {
  it('returns 404 when no goals have been set', async () => {
    const agent = await createAndLoginUser('goals-empty@example.com');

    const response = await agent.get('/goals');
    expect(response.status).toBe(404);
  });

  it('rejects the request when not logged in', async () => {
    const response = await request(app).get('/goals');
    expect(response.status).toBe(401);
  });
});

describe('PUT /goals', () => {
  it('creates goals on first call', async () => {
    const agent = await createAndLoginUser('goals-create@example.com');

    const response = await agent.put('/goals').send({
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
    const agent = await createAndLoginUser('goals-invalid@example.com');

    const response = await agent.put('/goals').send({
      calories: 2000,
      // missing protein, carbs, fat, fibre
    });

    expect(response.status).toBe(400);
  });

  it('updates existing goals instead of creating a duplicate row', async () => {
    const agent = await createAndLoginUser('goals-upsert@example.com');

    const firstResponse = await agent.put('/goals').send({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
      fibre: 30,
    });
    const userId = firstResponse.body.user_id;

    await agent.put('/goals').send({
      calories: 1800,
      protein: 140,
      carbs: 180,
      fat: 60,
      fibre: 28,
    });

    const getResponse = await agent.get('/goals');
    expect(getResponse.body.calories).toBe('1800');

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM daily_goals WHERE user_id = $1',
      [userId]
    );
    expect(countResult.rows[0].count).toBe('1');
  });
});