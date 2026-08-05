import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { pool } from '../db';
import { createAndLoginUser } from './helpers';

describe('GET /foods', () => {
  it('returns an empty array when there are no foods', async () => {
    const agent = await createAndLoginUser('foods-empty@example.com');

    const response = await agent.get('/foods');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('rejects the request when not logged in', async () => {
    const response = await request(app).get('/foods');
    expect(response.status).toBe(401);
  });
});

describe('POST /foods', () => {
  it('creates a food and returns it with a generated id', async () => {
    const agent = await createAndLoginUser('foods-create@example.com');

    const response = await agent.post('/foods').send({
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
    const agent = await createAndLoginUser('foods-invalid@example.com');

    const response = await agent.post('/foods').send({
      name: 'Rice',
      // missing required fields
    });

    expect(response.status).toBe(400);
  });
});

describe('GET /foods/:id', () => {
  it('returns 404 for a food that does not exist', async () => {
    const agent = await createAndLoginUser('foods-404@example.com');

    const response = await agent.get('/foods/00000000-0000-0000-0000-000000000099');
    expect(response.status).toBe(404);
  });
});

describe('user isolation', () => {
  it('does not return another user\'s food', async () => {
    const otherAgent = await createAndLoginUser('foods-other-user@example.com');

    const insertResponse = await otherAgent.post('/foods').send({
      name: 'Secret food',
      caloriesPer100g: 100,
      proteinPer100g: 10,
      carbsPer100g: 10,
      fatPer100g: 10,
      fibrePer100g: 1,
    });
    const otherUsersFoodId = insertResponse.body.id;

    const myAgent = await createAndLoginUser('foods-me@example.com');

    const getResponse = await myAgent.get(`/foods/${otherUsersFoodId}`);
    expect(getResponse.status).toBe(404);

    const listResponse = await myAgent.get('/foods');
    expect(listResponse.body).toEqual([]);
  });
});