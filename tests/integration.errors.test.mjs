// Integration tests: Auth flow with error cases
import request from 'supertest';
import app from '../server.js';

const rand = Math.random().toString(36).slice(2, 8);
const testEmail = `test_${rand}@example.com`;
const testPassword = 'ValidPass123!';

describe('Auth Endpoints: Error Cases', () => {
  test('signup rejects missing email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User', password: testPassword, companyName: 'TestCo' });
    expect(res.status).toBe(400);
  });

  test('signup rejects missing password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User', email: testEmail, companyName: 'TestCo' });
    expect(res.status).toBe(400);
  });

  test('signup rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User', email: 'invalid-email', password: testPassword, companyName: 'TestCo' });
    expect([400, 422]).toContain(res.status);
  });

  test('login rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: testPassword });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid|not found/i);
  });

  test('login rejects wrong password', async () => {
    // First create account
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User', email: testEmail, password: testPassword, companyName: 'TestCo' });
    
    // Try wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword123!' });
    expect(res.status).toBe(401);
  });

  test('signup prevents duplicate email', async () => {
    const email = `dup_${rand}@example.com`;
    
    // Create first
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User1', email, password: testPassword, companyName: 'TestCo' });
    
    // Try duplicate
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User2', email, password: testPassword, companyName: 'TestCo' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/exists|already/i);
  });
});

describe('Client Endpoints: Authorization', () => {
  let token1, token2;

  beforeAll(async () => {
    // Create two users
    const u1 = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User1', email: `user1_${rand}@example.com`, password: testPassword, companyName: 'Company1' });
    token1 = u1.body.token;

    const u2 = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User2', email: `user2_${rand}@example.com`, password: testPassword, companyName: 'Company2' });
    token2 = u2.body.token;
  });

  test('client creation requires auth', async () => {
    const res = await request(app)
      .post('/api/clients')
      .send({ name: 'Test Client', website: 'https://example.com' });
    expect(res.status).toBe(401);
  });

  test('client creation requires admin role (or user creates own)', async () => {
    // This depends on your role setup - adjust as needed
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Client1', website: 'https://example.com' });
    expect([201, 403]).toContain(res.status);
  });

  test('list clients requires auth', async () => {
    const res = await request(app)
      .get('/api/clients');
    expect(res.status).toBe(401);
  });

  test('authenticated user can list clients', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('invalid token rejected', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

describe('Rate Limiting', () => {
  test('auth endpoint is rate limited', async () => {
    let rateLimited = false;
    
    // Try 10 rapid login attempts (limit is 5 per 15 min)
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: `test${i}@example.com`, password: 'pass' });
      
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    
    expect(rateLimited).toBe(true);
  });
});
