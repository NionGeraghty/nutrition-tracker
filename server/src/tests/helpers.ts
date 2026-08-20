import request from 'supertest';
import app from '../app';

export async function createAndLoginUser(email: string) {
  const agent = request.agent(app);

  const response = await agent.post('/auth/signup').send({
    email,
    password: 'password123',
  });

  if (response.status !== 201) {
    throw new Error(`createAndLoginUser failed for ${email}: ${response.status} ${JSON.stringify(response.body)}`);
  }

  return agent;
}