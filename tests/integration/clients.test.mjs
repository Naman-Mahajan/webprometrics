// Integration tests for client management
import request from 'supertest';
import app from '../../server.js';

const rand = () => Math.random().toString(36).slice(2, 8);

describe('Client Management', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create test user and get token
    const email = `client_test_${rand()}@example.com`;
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Client Test User',
        email,
        password: 'ClientTest123!',
        companyName: 'ClientTestCo'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'ClientTest123!' });

    token = loginRes.body.token;
    userId = loginRes.body.user.id;
  });

  describe('Create Client', () => {
    it('creates client with valid data', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Client ${rand()}`,
          website: 'https://example.com',
          industry: 'Technology'
        });

      expect(res.status).toBe(201);
      expect(res.body.name || res.body[0]?.name).toBeDefined();
    });

    it('returns 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          website: 'https://example.com'
        });

      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid website URL', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Client ${rand()}`,
          website: 'not-a-valid-url'
        });

      expect(res.status).toBe(400);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/clients')
        .send({
          name: `Test Client ${rand()}`,
          website: 'https://example.com'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('List Clients', () => {
    beforeAll(async () => {
      // Create multiple clients for testing
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/clients')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `List Test Client ${i}`,
            website: `https://example${i}.com`
          });
      }
    });

    it('lists all user clients', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('returns empty array for user with no clients', async () => {
      // Create new user
      const newEmail = `noclient_${rand()}@example.com`;
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'No Client User',
          email: newEmail,
          password: 'NoClient123!',
          companyName: 'NoClientCo'
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: newEmail, password: 'NoClient123!' });

      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/clients');

      expect(res.status).toBe(401);
    });
  });

  describe('Update Client', () => {
    let clientId;

    beforeAll(async () => {
      // Create client to update
      const createRes = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Update Test Client',
          website: 'https://example.com'
        });

      const clients = Array.isArray(createRes.body) ? createRes.body : [createRes.body];
      clientId = clients[0].id;
    });

    it('updates client successfully', async () => {
      const res = await request(app)
        .put(`/api/clients/${clientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Client Name',
          website: 'https://updated.com'
        });

      expect([200, 201]).toContain(res.status);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .put(`/api/clients/${clientId}`)
        .send({
          name: 'Updated Name'
        });

      expect(res.status).toBe(401);
    });

    it('returns 404 for non-existent client', async () => {
      const res = await request(app)
        .put('/api/clients/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name'
        });

      expect(res.status).toBe(404);
    });
  });

  describe('Delete Client', () => {
    let clientId;

    beforeEach(async () => {
      // Create client to delete
      const createRes = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Delete Test Client ${rand()}`,
          website: 'https://example.com'
        });

      const clients = Array.isArray(createRes.body) ? createRes.body : [createRes.body];
      clientId = clients[0].id;
    });

    it('deletes client successfully', async () => {
      const res = await request(app)
        .delete(`/api/clients/${clientId}`)
        .set('Authorization', `Bearer ${token}`);

      expect([200, 204]).toContain(res.status);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .delete(`/api/clients/${clientId}`);

      expect(res.status).toBe(401);
    });

    it('returns 404 for non-existent client', async () => {
      const res = await request(app)
        .delete('/api/clients/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Client Isolation', () => {
    it('prevents user from accessing another user\'s clients', async () => {
      // Create first user and client
      const user1Email = `isolation1_${rand()}@example.com`;
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'User 1',
          email: user1Email,
          password: 'User1Pass123!',
          companyName: 'User1Co'
        });

      const login1 = await request(app)
        .post('/api/auth/login')
        .send({ email: user1Email, password: 'User1Pass123!' });

      const createRes = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${login1.body.token}`)
        .send({
          name: 'User 1 Client',
          website: 'https://user1.com'
        });

      const clients = Array.isArray(createRes.body) ? createRes.body : [createRes.body];
      const user1ClientId = clients[0].id;

      // Create second user
      const user2Email = `isolation2_${rand()}@example.com`;
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'User 2',
          email: user2Email,
          password: 'User2Pass123!',
          companyName: 'User2Co'
        });

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({ email: user2Email, password: 'User2Pass123!' });

      // User 2 tries to access User 1's client
      const res = await request(app)
        .get(`/api/clients/${user1ClientId}`)
        .set('Authorization', `Bearer ${login2.body.token}`);

      expect([403, 404]).toContain(res.status);
    });
  });
});
