import request from 'supertest';
import app from '../app';

export async function createAndLoginUser(email: string) {
  const agent = request.agent(app);

  await agent.post('/auth/signup').send({
    email,
    password: 'password123',
  });

  return agent;
}