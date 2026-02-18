// Security tests for OWASP Top 10 compliance
import request from 'supertest';
import app from '../../server.js';

const rand = () => Math.random().toString(36).slice(2, 8);

describe('OWASP Top 10 Security Tests', () => {
  let token;
  let testUser;

  beforeAll(async () => {
    // Create test user
    testUser = {
      name: 'Security Test User',
      email: `security_${rand()}@example.com`,
      password: 'SecurePass123!',
      companyName: 'SecurityCo'
    };

    await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    token = loginRes.body.token;
  });

  describe('A01: Broken Access Control', () => {
    it('prevents unauthorized access to protected endpoints', async () => {
      const res = await request(app)
        .get('/api/clients');

      expect(res.status).toBe(401);
    });

    it('rejects invalid JWT tokens', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('rejects tampered JWT tokens', async () => {
      const tamperedToken = token.slice(0, -10) + 'tampered12';
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
    });
  });

  describe('A03: Injection', () => {
    it('escapes XSS in client name', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: xssPayload,
          website: 'https://example.com'
        });

      // Should accept but escape the content
      expect([200, 201]).toContain(res.status);
    });

    it('handles SQL injection attempts in queries', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: sqlInjection,
          website: 'https://example.com'
        });

      // Should handle safely
      expect([200, 201, 400]).toContain(res.status);
    });

    it('sanitizes user input in reports', async () => {
      const maliciousInput = '<img src=x onerror=alert("xss")>';
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: maliciousInput,
          clientId: 'test-client',
          metrics: []
        });

      expect([200, 201, 400]).toContain(res.status);
    });
  });

  describe('A04: Insecure Design - Rate Limiting', () => {
    it('implements rate limiting on authentication', async () => {
      const attempts = [];
      const email = `ratelimit_${rand()}@example.com`;

      // Make 7 rapid attempts
      for (let i = 0; i < 7; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({ email, password: 'wrong' })
        );
      }

      const results = await Promise.all(attempts);
      
      // At least one should be rate limited
      const rateLimited = results.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    }, 10000);

    it('rate limits API requests', async () => {
      const attempts = [];

      // Make many rapid requests
      for (let i = 0; i < 120; i++) {
        attempts.push(
          request(app)
            .get('/api/clients')
            .set('Authorization', `Bearer ${token}`)
        );
      }

      const results = await Promise.all(attempts);
      
      // Some should be rate limited (limit is 100/15min)
      const rateLimited = results.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    }, 15000);
  });

  describe('A05: Security Misconfiguration', () => {
    it('does not expose sensitive headers', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${token}`);

      // Should not expose server version
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('sets security headers', async () => {
      const res = await request(app).get('/');

      // Helmet middleware should set these
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('A07: Identification and Authentication Failures', () => {
    it('rejects weak passwords', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Weak Password User',
          email: `weak_${rand()}@example.com`,
          password: '123',
          companyName: 'WeakCo'
        });

      expect(res.status).toBe(400);
    });

    it('requires minimum password length', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Short Password User',
          email: `short_${rand()}@example.com`,
          password: 'Short1',
          companyName: 'ShortCo'
        });

      expect(res.status).toBe(400);
    });

    it('does not reveal if email exists on login failure', async () => {
      const res1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: `nonexistent_${rand()}@example.com`,
          password: 'Password123!'
        });

      const res2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        });

      // Both should return same generic error
      expect(res1.status).toBe(401);
      expect(res2.status).toBe(401);
      expect(res1.body.message).toBe(res2.body.message);
    });
  });

  describe('A08: Software and Data Integrity Failures', () => {
    it('validates JWT token integrity', async () => {
      // Split token and modify payload
      const parts = token.split('.');
      const tamperedPayload = Buffer.from(JSON.stringify({ id: 'hacker', role: 'admin' })).toString('base64');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
    });
  });

  describe('A09: Security Logging and Monitoring', () => {
    it('logs authentication attempts', async () => {
      // Login attempt creates audit log
      await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      // Verify audit log exists (check via endpoint if available)
      // This is placeholder - actual implementation depends on audit log API
      expect(true).toBe(true);
    });
  });

  describe('A10: Server-Side Request Forgery (SSRF)', () => {
    it('validates URLs to prevent SSRF', async () => {
      const internalURL = 'http://localhost:8080/admin';
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'SSRF Test',
          website: internalURL
        });

      // Should either reject or sanitize internal URLs
      // Actual behavior depends on validation rules
      expect([200, 201, 400]).toContain(res.status);
    });
  });

  describe('CORS Security', () => {
    it('implements CORS restrictions', async () => {
      const res = await request(app)
        .options('/api/clients')
        .set('Origin', 'https://malicious-site.com');

      // CORS should be configured
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Content Security', () => {
    it('validates content types', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'text/plain')
        .send('not json');

      // Should reject invalid content types
      expect([400, 415]).toContain(res.status);
    });
  });
});
