import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { createAndLoginUser } from './helpers';

describe('POST /editors', () => {
  it('grants editor access to another user by email', async () => {
    const owner = await createAndLoginUser('owner1@example.com');
    await createAndLoginUser('editor1@example.com');

    const response = await owner.post('/editors').send({ email: 'editor1@example.com' });

    expect(response.status).toBe(201);
  });

  it('rejects granting access to an email that does not exist', async () => {
    const owner = await createAndLoginUser('owner2@example.com');

    const response = await owner.post('/editors').send({ email: 'nobody@example.com' });

    expect(response.status).toBe(404);
  });

  it('rejects adding yourself', async () => {
    const owner = await createAndLoginUser('owner3@example.com');

    const response = await owner.post('/editors').send({ email: 'owner3@example.com' });

    expect(response.status).toBe(400);
  });

  it('rejects adding the same editor twice', async () => {
    const owner = await createAndLoginUser('owner4@example.com');
    await createAndLoginUser('editor4@example.com');

    await owner.post('/editors').send({ email: 'editor4@example.com' });
    const response = await owner.post('/editors').send({ email: 'editor4@example.com' });

    expect(response.status).toBe(400);
  });

  it('rejects the request when not logged in', async () => {
    const response = await request(app).post('/editors').send({ email: 'anyone@example.com' });
    expect(response.status).toBe(401);
  });
});

describe('GET /editors/mine', () => {
  it('lists editors I have granted access to', async () => {
    const owner = await createAndLoginUser('owner5@example.com');
    await createAndLoginUser('editor5@example.com');

    await owner.post('/editors').send({ email: 'editor5@example.com' });

    const response = await owner.get('/editors/mine');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].email).toBe('editor5@example.com');
  });

  it('returns an empty array when no editors have been granted', async () => {
    const owner = await createAndLoginUser('owner6@example.com');

    const response = await owner.get('/editors/mine');

    expect(response.body).toEqual([]);
  });
});

describe('GET /editors/granted-to-me', () => {
  it('lists accounts I have been granted access to', async () => {
    const owner = await createAndLoginUser('owner7@example.com');
    const editor = await createAndLoginUser('editor7@example.com');

    await owner.post('/editors').send({ email: 'editor7@example.com' });

    const response = await editor.get('/editors/granted-to-me');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].email).toBe('owner7@example.com');
  });
});

describe('GET /editors/unreciprocated', () => {
  it('shows an owner who granted access but was not granted access back', async () => {
    const owner = await createAndLoginUser('owner8@example.com');
    const editor = await createAndLoginUser('editor8@example.com');

    await owner.post('/editors').send({ email: 'editor8@example.com' });

    const response = await editor.get('/editors/unreciprocated');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].email).toBe('owner8@example.com');
  });

  it('does not show a relationship that has already been reciprocated', async () => {
    const owner = await createAndLoginUser('owner9@example.com');
    const editor = await createAndLoginUser('editor9@example.com');

    await owner.post('/editors').send({ email: 'editor9@example.com' });
    await editor.post('/editors').send({ email: 'owner9@example.com' });

    const response = await editor.get('/editors/unreciprocated');

    expect(response.body).toEqual([]);
  });
});

describe('DELETE /editors/:id', () => {
  it('removes editor access', async () => {
    const owner = await createAndLoginUser('owner10@example.com');
    await createAndLoginUser('editor10@example.com');

    const addResponse = await owner.post('/editors').send({ email: 'editor10@example.com' });
    const permissionId = addResponse.body.id;

    const deleteResponse = await owner.delete(`/editors/${permissionId}`);
    expect(deleteResponse.status).toBe(204);

    const listResponse = await owner.get('/editors/mine');
    expect(listResponse.body).toEqual([]);
  });

  it('returns 404 when deleting a permission that does not belong to you', async () => {
    const owner = await createAndLoginUser('owner11@example.com');
    const stranger = await createAndLoginUser('stranger11@example.com');
    await createAndLoginUser('editor11@example.com');

    const addResponse = await owner.post('/editors').send({ email: 'editor11@example.com' });
    const permissionId = addResponse.body.id;

    const response = await stranger.delete(`/editors/${permissionId}`);
    expect(response.status).toBe(404);
  });
});