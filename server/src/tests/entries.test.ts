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

describe('POST /entries/copy', () => {
  it('copies all entries from one date to another', async () => {
    const agent = await createAndLoginUser('copy-basic@example.com');

    const foodResponse = await agent.post('/foods').send({
      name: 'Rice',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fibrePer100g: 0.4,
    });
    const foodId = foodResponse.body[0].id;

    await agent.post('/entries').send({
      foodId,
      date: '2026-08-27',
      grams: 100,
      mealType: 'breakfast',
    });
    await agent.post('/entries').send({
      foodId,
      date: '2026-08-27',
      grams: 50,
      mealType: 'lunch',
    });

    const response = await agent.post('/entries/copy').send({
      fromDate: '2026-08-27',
      toDate: '2026-08-28',
    });

    expect(response.status).toBe(201);
    expect(response.body.copied).toBe(2);

    const newDayResponse = await agent.get('/entries?date=2026-08-28');
    expect(newDayResponse.body).toHaveLength(2);
  });

  it('returns 404 when the source date has no entries', async () => {
    const agent = await createAndLoginUser('copy-empty@example.com');

    const response = await agent.post('/entries/copy').send({
      fromDate: '2099-01-01',
      toDate: '2099-01-02',
    });

    expect(response.status).toBe(404);
  });

  it('rejects copying to another account without permission', async () => {
    const agent = await createAndLoginUser('copy-no-perm@example.com');
    const stranger = await createAndLoginUser('copy-stranger@example.com');

    const strangerMe = await stranger.get('/auth/me');
    const strangerId = strangerMe.body.id;

    const response = await agent.post('/entries/copy').send({
      fromDate: '2026-08-27',
      toDate: '2026-08-28',
      targetUserId: strangerId,
    });

    expect(response.status).toBe(403);
  });

  it('copies entries to a shared account when permission is granted', async () => {
    const owner = await createAndLoginUser('copy-owner@example.com');
    const editor = await createAndLoginUser('copy-editor@example.com');

    await owner.post('/editors').send({ email: 'copy-editor@example.com' });

    const ownerMe = await owner.get('/auth/me');
    const ownerId = ownerMe.body.id;

    const foodResponse = await owner.post('/foods').send({
      name: 'Oats',
      caloriesPer100g: 389,
      proteinPer100g: 16.9,
      carbsPer100g: 66,
      fatPer100g: 6.9,
      fibrePer100g: 10.6,
    });
    const foodId = foodResponse.body[0].id;

    await editor.post('/entries').send({
      foodId,
      date: '2026-08-27',
      grams: 50,
      mealType: 'breakfast',
      targetUserId: ownerId,
    });

    const response = await editor.post('/entries/copy').send({
      fromDate: '2026-08-27',
      toDate: '2026-08-28',
      targetUserId: ownerId,
    });

    expect(response.status).toBe(201);
    expect(response.body.copied).toBe(1);
  });
});

describe('GET /entries with forUserId', () => {
  it('returns the target account\'s entries when permission has been granted', async () => {
    const owner = await createAndLoginUser('entryperm-owner@example.com');
    const editor = await createAndLoginUser('entryperm-editor@example.com');

    await owner.post('/editors').send({ email: 'entryperm-editor@example.com' });

    const ownerMe = await owner.get('/auth/me');
    const ownerId = ownerMe.body.id;

    const foodResponse = await owner.post('/foods').send({
      name: 'Owner Food',
      caloriesPer100g: 100,
      proteinPer100g: 10,
      carbsPer100g: 10,
      fatPer100g: 10,
      fibrePer100g: 1,
    });
    const foodId = foodResponse.body[0].id;

    await owner.post('/entries').send({
      foodId,
      date: '2026-08-27',
      grams: 100,
      mealType: 'breakfast',
    });

    const response = await editor.get(`/entries?date=2026-08-27&forUserId=${ownerId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('rejects viewing another account\'s entries without permission', async () => {
    const agent = await createAndLoginUser('entryperm-noaccess@example.com');
    const stranger = await createAndLoginUser('entryperm-stranger@example.com');

    const strangerMe = await stranger.get('/auth/me');
    const strangerId = strangerMe.body.id;

    const response = await agent.get(`/entries?date=2026-08-27&forUserId=${strangerId}`);

    expect(response.status).toBe(403);
  });
});

describe('PUT /entries/:id with targetUserId', () => {
  it('updates an entry in a shared account when permission is granted', async () => {
    const owner = await createAndLoginUser('updateperm-owner@example.com');
    const editor = await createAndLoginUser('updateperm-editor@example.com');

    await owner.post('/editors').send({ email: 'updateperm-editor@example.com' });

    const ownerMe = await owner.get('/auth/me');
    const ownerId = ownerMe.body.id;

    const foodResponse = await owner.post('/foods').send({
      name: 'Owner Food',
      caloriesPer100g: 100,
      proteinPer100g: 10,
      carbsPer100g: 10,
      fatPer100g: 10,
      fibrePer100g: 1,
    });
    const foodId = foodResponse.body[0].id;

    const createResponse = await editor.post('/entries').send({
      foodId,
      date: '2026-08-27',
      grams: 100,
      mealType: 'breakfast',
      targetUserId: ownerId,
    });
    const entryId = createResponse.body.id;

    const updateResponse = await editor.put(`/entries/${entryId}`).send({
      foodId,
      date: '2026-08-27',
      grams: 200,
      mealType: 'lunch',
      targetUserId: ownerId,
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.grams).toBe('200');
  });

  it('rejects updating another account\'s entry without permission', async () => {
    const agent = await createAndLoginUser('updateperm-noaccess@example.com');
    const stranger = await createAndLoginUser('updateperm-stranger@example.com');

    const strangerMe = await stranger.get('/auth/me');
    const strangerId = strangerMe.body.id;

    const response = await agent.put('/entries/00000000-0000-0000-0000-000000000099').send({
      foodId: '00000000-0000-0000-0000-000000000098',
      date: '2026-08-27',
      grams: 100,
      mealType: 'breakfast',
      targetUserId: strangerId,
    });

    expect(response.status).toBe(403);
  });
});

describe('DELETE /entries/:id with forUserId', () => {
  it('deletes an entry in a shared account when permission is granted', async () => {
    const owner = await createAndLoginUser('deleteperm-owner@example.com');
    const editor = await createAndLoginUser('deleteperm-editor@example.com');

    await owner.post('/editors').send({ email: 'deleteperm-editor@example.com' });

    const ownerMe = await owner.get('/auth/me');
    const ownerId = ownerMe.body.id;

    const foodResponse = await owner.post('/foods').send({
      name: 'Owner Food',
      caloriesPer100g: 100,
      proteinPer100g: 10,
      carbsPer100g: 10,
      fatPer100g: 10,
      fibrePer100g: 1,
    });
    const foodId = foodResponse.body[0].id;

    const createResponse = await editor.post('/entries').send({
      foodId,
      date: '2026-08-27',
      grams: 100,
      mealType: 'breakfast',
      targetUserId: ownerId,
    });
    const entryId = createResponse.body.id;

    const deleteResponse = await editor.delete(`/entries/${entryId}?forUserId=${ownerId}`);
    expect(deleteResponse.status).toBe(204);
  });

  it('rejects deleting another account\'s entry without permission', async () => {
    const agent = await createAndLoginUser('deleteperm-noaccess@example.com');
    const stranger = await createAndLoginUser('deleteperm-stranger@example.com');

    const strangerMe = await stranger.get('/auth/me');
    const strangerId = strangerMe.body.id;

    const response = await agent.delete(
      `/entries/00000000-0000-0000-0000-000000000099?forUserId=${strangerId}`
    );

    expect(response.status).toBe(403);
  });
});