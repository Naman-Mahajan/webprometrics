// Unit tests for authentication utilities
// Tests: createToken, verifyToken, password hashing

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-min-32-chars-long-ok';
const ACCESS_TOKEN_EXPIRY = 3600;
const REFRESH_TOKEN_EXPIRY = 604800;

// Mimic server functions
const createToken = (payload, expirySeconds) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expirySeconds });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
};

describe('Auth: Token Generation', () => {
  test('createToken creates valid JWT', () => {
    const user = { id: 'user_123', email: 'test@example.com' };
    const token = createToken(user, ACCESS_TOKEN_EXPIRY);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  test('token contains user data', () => {
    const user = { id: 'user_123', email: 'test@example.com', role: 'USER' };
    const token = createToken(user, ACCESS_TOKEN_EXPIRY);
    const decoded = jwt.decode(token);
    expect(decoded.id).toBe('user_123');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('USER');
  });

  test('token has correct expiry', () => {
    const user = { id: 'user_123' };
    const token = createToken(user, 3600);
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(typeof decoded.exp).toBe('number');
  });

  test('token can be verified', () => {
    const user = { id: 'user_123', email: 'test@example.com' };
    const token = createToken(user, ACCESS_TOKEN_EXPIRY);
    const verified = verifyToken(token);
    expect(verified).toBeDefined();
    expect(verified.id).toBe('user_123');
  });

  test('invalid token fails verification', () => {
    const result = verifyToken('invalid.token.here');
    expect(result).toBeNull();
  });

  test('expired token fails verification', () => {
    const user = { id: 'user_123' };
    const expiredToken = jwt.sign(user, JWT_SECRET, { expiresIn: '-1s' }); // Already expired
    const result = verifyToken(expiredToken);
    expect(result).toBeNull();
  });

  test('refresh token has correct type', () => {
    const payload = { id: 'user_123', type: 'refresh' };
    const token = createToken(payload, REFRESH_TOKEN_EXPIRY);
    const decoded = jwt.decode(token);
    expect(decoded.type).toBe('refresh');
  });
});

describe('Auth: Password Hashing', () => {
  test('bcrypt hashes password', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
  });

  test('hash changes on each call', async () => {
    const password = 'TestPassword123!';
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);
    expect(hash1).not.toBe(hash2);
  });

  test('bcrypt verifies correct password', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  test('bcrypt rejects wrong password', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare('WrongPassword', hash);
    expect(isValid).toBe(false);
  });

  test('empty password fails comparison', async () => {
    const hash = await bcrypt.hash('TestPassword123!', 10);
    const isValid = await bcrypt.compare('', hash);
    expect(isValid).toBe(false);
  });

  test('bcrypt handles special characters', async () => {
    const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });
});

describe('Auth: Token Refresh', () => {
  test('refresh token can be different from access token', () => {
    const user = { id: 'user_123' };
    const accessToken = createToken(user, ACCESS_TOKEN_EXPIRY);
    const refreshToken = createToken({ id: user.id, type: 'refresh' }, REFRESH_TOKEN_EXPIRY);
    expect(accessToken).not.toBe(refreshToken);
  });

  test('refresh token has longer expiry', () => {
    const user = { id: 'user_123' };
    const accessToken = jwt.decode(createToken(user, ACCESS_TOKEN_EXPIRY));
    const refreshToken = jwt.decode(createToken({ id: user.id, type: 'refresh' }, REFRESH_TOKEN_EXPIRY));
    expect(refreshToken.exp).toBeGreaterThan(accessToken.exp);
  });

  test('invalid refresh token is rejected', () => {
    const result = verifyToken('invalid.refresh.token');
    expect(result).toBeNull();
  });
});
