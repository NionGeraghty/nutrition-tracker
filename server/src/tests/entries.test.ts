import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { createAndLoginUser } from './helpers';

describe('POST /entries', () => {
  it('creates an entry when the food exists', async () => {
    const agent = await createAndLoginUser('entries-create@example.com');

    const foodResponse = await agent.post('/foods').send({
      name: 'Rice',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fibrePer100g: 0.4,
    });
    const foodId = foodResponse.body[0].id;

    const entryResponse = await agent.post('/entries').send({
      foodId,
      date: '2026-07-13',
      grams: 150,
      mealType: 'lunch',
    });

    expect(entryResponse.status).toBe(201);
    expect(entryResponse.body.food_id).toBe(foodId);
    expect(entryResponse.body.meal_type).toBe('lunch');
  });

  it('rejects an entry referencing a food that does not exist', async () => {
    const agent = await createAndLoginUser('entries-no-food@example.com');

    const response = await agent.post('/entries').send({
      foodId: '00000000-0000-0000-0000-000000000099',
      date: '2026-07-13',
      grams: 150,
      mealType: 'lunch',
    });

    expect(response.status).toBe(400);
  });

  it('rejects invalid entry data', async () => {
    const agent = await createAndLoginUser('entries-invalid@example.com');

    const response = await agent.post('/entries').send({
      date: '2026-07-13',
      // missing foodId, grams, and mealType
    });

    expect(response.status).toBe(400);
  });

  it('rejects an entry with an invalid mealType', async () => {
    const agent = await createAndLoginUser('entries-bad-mealtype@example.com');

    const foodResponse = await agent.post('/foods').send({
      name: 'Rice',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fibrePer100g: 0.4,
    });
    const foodId = foodResponse.body[0].id;

    const response = await agent.post('/entries').send({
      foodId,
      date: '2026-07-13',
      grams: 150,
      mealType: 'brunch',
    });

    expect(response.status).toBe(400);
  });

  it('rejects the request when not logged in', async () => {
    const response = await request(app).post('/entries').send({
      foodId: '00000000-0000-0000-0000-000000000099',
      date: '2026-07-13',
      grams: 150,
      mealType: 'lunch',
    });

    expect(response.status).toBe(401);
  });
});

describe('GET /entries', () => {
  it('returns entries for the requested date, joined with food details', async () => {
    const agent = await createAndLoginUser('entries-get@example.com');

    const foodResponse = await agent.post('/foods').send({
      name: 'Oats',
      caloriesPer100g: 389,
      proteinPer100g: 16.9,
      carbsPer100g: 66,
      fatPer100g: 6.9,
      fibrePer100g: 10.6,
    });
    const foodId = foodResponse.body[0].id;

    await agent.post('/entries').send({
      foodId,
      date: '2026-07-13',
      grams: 50,
      mealType: 'breakfast',
    });

    const response = await agent.get('/entries?date=2026-07-13');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Oats');
    expect(response.body[0].grams).toBe('50');
    expect(response.body[0].meal_type).toBe('breakfast');
  });

  it('returns an empty array for a date with no entries', async () => {
    const agent = await createAndLoginUser('entries-empty@example.com');

    const response = await agent.get('/entries?date=2099-01-01');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('PUT /entries/:id', () => {
  it('updates an existing entry', async () => {
    const agent = await createAndLoginUser('entries-update@example.com');

    const foodResponse = await agent.post('/foods').send({
      name: 'Rice',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fibrePer100g: 0.4,
    });
    const foodId = foodResponse.body[0].id;

    const createResponse = await agent.post('/entries').send({
      foodId,
      date: '2026-07-13',
      grams: 100,
      mealType: 'breakfast',
    });
    const entryId = createResponse.body.id;

    const updateResponse = await agent.put(`/entries/${entryId}`).send({
      foodId,
      date: '2026-07-13',
      grams: 200,
      mealType: 'lunch',
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.grams).toBe('200');
    expect(updateResponse.body.meal_type).toBe('lunch');
  });

  it('returns 404 when updating an entry that does not exist', async () => {
    const agent = await createAndLoginUser('entries-update-404@example.com');

    const foodResponse = await agent.post('/foods').send({
      name: 'Rice',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fibrePer100g: 0.4,
    });
    const foodId = foodResponse.body[0].id;

    const response = await agent.put('/entries/00000000-0000-0000-0000-000000000099').send({
      foodId,
      date: '2026-07-13',
      grams: 200,
      mealType: 'lunch',
    });

    expect(response.status).toBe(404);
  });
});

describe('user isolation', () => {
  it('does not return another user\'s entries', async () => {
    const otherAgent = await createAndLoginUser('entries-other-user@example.com');

    const foodResponse = await otherAgent.post('/foods').send({
      name: 'Other user food',
      caloriesPer100g: 100,
      proteinPer100g: 10,
      carbsPer100g: 10,
      fatPer100g: 10,
      fibrePer100g: 1,
    });
    const otherUsersFoodId = foodResponse.body[0].id;

    await otherAgent.post('/entries').send({
      foodId: otherUsersFoodId,
      date: '2026-07-13',
      grams: 100,
      mealType: 'lunch',
    });

    const myAgent = await createAndLoginUser('entries-me@example.com');

    const response = await myAgent.get('/entries?date=2026-07-13');
    expect(response.body).toEqual([]);
  });
});