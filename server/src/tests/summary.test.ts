import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { createAndLoginUser } from './helpers';

describe('GET /summary', () => {
  it('returns 400 if date query parameter is missing', async () => {
    const agent = await createAndLoginUser('summary-missing-date@example.com');

    const response = await agent.get('/summary');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('A date query parameter is required');
  });

  it('rejects the request when not logged in', async () => {
    const response = await request(app).get('/summary?date=2024-06-01');
    expect(response.status).toBe(401);
  });

  it('returns zeroed totals when there are no entries for the date', async () => {
    const agent = await createAndLoginUser('summary-empty@example.com');

    const response = await agent.get('/summary').query({ date: '2099-01-01' });

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
    const agent = await createAndLoginUser('summary-no-goals@example.com');

    const response = await agent.get('/summary').query({ date: '2024-06-01' });

    expect(response.status).toBe(200);
    expect(response.body.goals).toBeNull();
    expect(response.body.remaining).toBeNull();
  });

  it('returns correct totals, goals, and remaining when entries and goals exist', async () => {
    const agent = await createAndLoginUser('summary-full@example.com');

    const foodResponse = await agent.post('/foods').send({
      name: 'Test Food',
      caloriesPer100g: 200,
      proteinPer100g: 10,
      carbsPer100g: 30,
      fatPer100g: 5,
      fibrePer100g: 2,
    });
    const foodId = foodResponse.body[0].id;

    await agent.post('/entries').send({
      foodId,
      date: '2024-06-01',
      grams: 150,
      mealType: 'lunch',
    });

    await agent.put('/goals').send({
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
      fibre: 30,
    });

    const response = await agent.get('/summary').query({ date: '2024-06-01' });

    expect(response.status).toBe(200);
    expect(response.body.totals.calories).toBeCloseTo(300);
    expect(response.body.totals.protein).toBeCloseTo(15);
    expect(response.body.goals.calories).toBe(2000);
    expect(response.body.remaining.calories).toBeCloseTo(1700);
    expect(response.body.remaining.protein).toBeCloseTo(135);
  });

  it('sums multiple entries on the same date correctly', async () => {
    const agent = await createAndLoginUser('summary-multi@example.com');

    const foodResponse = await agent.post('/foods').send({
      name: 'Test Food',
      caloriesPer100g: 100,
      proteinPer100g: 10,
      carbsPer100g: 10,
      fatPer100g: 10,
      fibrePer100g: 1,
    });
    const foodId = foodResponse.body[0].id;

    await agent.post('/entries').send({
      foodId,
      date: '2024-06-01',
      grams: 100,
      mealType: 'breakfast',
    });
    await agent.post('/entries').send({
      foodId,
      date: '2024-06-01',
      grams: 50,
      mealType: 'lunch',
    });

    const response = await agent.get('/summary').query({ date: '2024-06-01' });

    expect(response.body.totals.calories).toBeCloseTo(150);
  });
});

describe('GET /summary with forUserId', () => {
  it('returns the target account\'s summary when permission has been granted', async () => {
    const owner = await createAndLoginUser('summaryperm-owner@example.com');
    const editor = await createAndLoginUser('summaryperm-editor@example.com');

    await owner.post('/editors').send({ email: 'summaryperm-editor@example.com' });

    const ownerMe = await owner.get('/auth/me');
    const ownerId = ownerMe.body.id;

    const foodResponse = await owner.post('/foods').send({
      name: 'Owner Food',
      caloriesPer100g: 200,
      proteinPer100g: 10,
      carbsPer100g: 30,
      fatPer100g: 5,
      fibrePer100g: 2,
    });
    const foodId = foodResponse.body[0].id;

    await owner.post('/entries').send({
      foodId,
      date: '2026-08-27',
      grams: 100,
      mealType: 'breakfast',
    });

    const response = await editor.get(`/summary?date=2026-08-27&forUserId=${ownerId}`);

    expect(response.status).toBe(200);
    expect(response.body.totals.calories).toBeCloseTo(200);
  });

  it('rejects viewing another account\'s summary without permission', async () => {
    const agent = await createAndLoginUser('summaryperm-noaccess@example.com');
    const stranger = await createAndLoginUser('summaryperm-stranger@example.com');

    const strangerMe = await stranger.get('/auth/me');
    const strangerId = strangerMe.body.id;

    const response = await agent.get(`/summary?date=2026-08-27&forUserId=${strangerId}`);

    expect(response.status).toBe(403);
  });
});