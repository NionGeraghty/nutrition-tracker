import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { pool } from '../db';

describe('POST /auth/signup', () => {
  it('creates a new user and starts a session', async () => {
    const agent = request.agent(app);

    const response = await agent.post('/auth/signup').send({
      email: 'signup-test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('signup-test@example.com');

    const meResponse = await agent.get('/auth/me');
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.email).toBe('signup-test@example.com');
  });

  it('rejects a password shorter than 8 characters', async () => {
    const response = await request(app).post('/auth/signup').send({
      email: 'short-pw@example.com',
      password: 'short',
    });

    expect(response.status).toBe(400);
  });

  it('rejects signup with an email that already exists', async () => {
    await request(app).post('/auth/signup').send({
      email: 'duplicate@example.com',
      password: 'password123',
    });

    const response = await request(app).post('/auth/signup').send({
      email: 'duplicate@example.com',
      password: 'anotherpassword',
    });

    expect(response.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('logs in with correct credentials and starts a session', async () => {
    await request(app).post('/auth/signup').send({
      email: 'login-test@example.com',
      password: 'password123',
    });

    const agent = request.agent(app);

    const loginResponse = await agent.post('/auth/login').send({
      email: 'login-test@example.com',
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.email).toBe('login-test@example.com');

    const meResponse = await agent.get('/auth/me');
    expect(meResponse.status).toBe(200);
  });

  it('rejects an incorrect password', async () => {
    await request(app).post('/auth/signup').send({
      email: 'wrong-pw@example.com',
      password: 'correctpassword',
    });

    const response = await request(app).post('/auth/login').send({
      email: 'wrong-pw@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
  });

  it('rejects a login for an email that does not exist', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'nobody@example.com',
      password: 'whatever123',
    });

    expect(response.status).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  it('ends the session so /auth/me returns 401 afterwards', async () => {
    const agent = request.agent(app);

    await agent.post('/auth/signup').send({
      email: 'logout-test@example.com',
      password: 'password123',
    });

    const logoutResponse = await agent.post('/auth/logout');
    expect(logoutResponse.status).toBe(204);

    const meResponse = await agent.get('/auth/me');
    expect(meResponse.status).toBe(401);
  });
});

describe('GET /auth/me', () => {
  it('returns 401 when not logged in', async () => {
    const response = await request(app).get('/auth/me');
    expect(response.status).toBe(401);
  });
});