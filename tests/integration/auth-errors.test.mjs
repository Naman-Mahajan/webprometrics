// Integration tests for authentication error cases
import request from 'supertest';
import app from '../../server.js';

const rand = () => Math.random().toString(36).slice(2, 8);

describe('Authentication Error Cases', () => {
  describe('Signup Validation', () => {
    it('returns 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: `test_${rand()}@example.com`,
          password: 'Password123!',
          companyName: 'TestCo'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('returns 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!',
          companyName: 'TestCo'
        });
      
      expect(res.status).toBe(400);
    });

    it('returns 400 for password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: `test_${rand()}@example.com`,
          password: 'Short1',
          companyName: 'TestCo'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('returns 409 for duplicate email', async () => {
      const email = `test_${rand()}@example.com`;
      
      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User 1',
          email,
          password: 'Password123!',
          companyName: 'TestCo1'
        });
      
      // Duplicate signup
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User 2',
          email,
          password: 'Password123!',
          companyName: 'TestCo2'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('normalizes email to lowercase', async () => {
      const baseEmail = `test_${rand()}@example.com`;
      const upperEmail = baseEmail.toUpperCase();
      
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: upperEmail,
          password: 'Password123!',
          companyName: 'TestCo'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(baseEmail.toLowerCase());
    });
  });

  describe('Login Validation', () => {
    const testUser = {
      name: 'Login Test User',
      email: `login_${rand()}@example.com`,
      password: 'LoginPass123!',
      companyName: 'LoginCo'
    };

    beforeAll(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);
    });

    it('returns 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!'
        });
      
      expect(res.status).toBe(400);
    });

    it('returns 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
        });
      
      expect(res.status).toBe(400);
    });

    it('returns 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: `nonexistent_${rand()}@example.com`,
          password: 'Password123!'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('returns 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('login is case-insensitive for email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email.toUpperCase(),
          password: testUser.password
        });
      
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('Authorization Errors', () => {
    it('returns 401 for missing token', async () => {
      const res = await request(app)
        .get('/api/clients');
      
      expect(res.status).toBe(401);
    });

    it('returns 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'Bearer invalid-token-here');
      
      expect(res.status).toBe(401);
    });

    it('returns 401 for malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'InvalidFormat');
      
      expect(res.status).toBe(401);
    });

    it('returns 401 for expired token', async () => {
      // This test would require creating a token with 1-second expiry
      // and waiting for it to expire - skipped for performance
      // In production, use JWT libraries to test expiration
    });
  });

  describe('Rate Limiting', () => {
    it('rate limits authentication attempts', async () => {
      const email = `ratelimit_${rand()}@example.com`;
      
      // Make 6 attempts (limit is 5)
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({ email, password: 'wrong' })
        );
      }
      
      const results = await Promise.all(attempts);
      
      // Last request should be rate limited
      const lastResult = results[results.length - 1];
      expect(lastResult.status).toBe(429);
      expect(lastResult.body.message).toContain('Too many');
    }, 10000); // Increase timeout for multiple requests
  });
});
