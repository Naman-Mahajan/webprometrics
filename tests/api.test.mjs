import request from 'supertest';
import app from '../server.js';

// Minimal API test: signup -> login -> create client -> list clients

const rand = Math.random().toString(36).slice(2, 8);
const email = `jest_${rand}@example.com`;
const password = `Jest!23${rand}`;

describe('API smoke (Prisma-first with JSON fallback)', () => {
  let token;

  it('signs up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Jest User', email, password, companyName: 'JestCo' });
    expect(res.status).toBe(201);
    expect(res.body.user?.email).toBe(email);
  });

  it('logs in the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('creates a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Client ${rand}`, website: 'https://example.com' });
    expect(res.status).toBe(201);
    expect(res.body.name || res.body[0]?.name).toBeDefined();
  });

  it('lists clients and finds the created one', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const list = Array.isArray(res.body) ? res.body : [];
    expect(list.some(c => c.name === `Client ${rand}`)).toBe(true);
  });
});
