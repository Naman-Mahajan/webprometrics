// Unit tests for authentication utilities
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Utilities to test
const createToken = (user, expirySeconds) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: expirySeconds });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

describe('Auth Utilities - JWT Token Management', () => {
  describe('createToken', () => {
    it('creates a valid JWT token', () => {
      const user = { id: '123', email: 'test@example.com' };
      const token = createToken(user, 3600);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('token contains user data', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = createToken(user, 3600);
      const decoded = jwt.decode(token);
      
      expect(decoded.id).toBe('123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('user');
    });

    it('token has expiration time', () => {
      const user = { id: '123' };
      const token = createToken(user, 3600);
      const decoded = jwt.decode(token);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(3600);
    });

    it('creates different tokens for different users', () => {
      const user1 = { id: '123', email: 'user1@example.com' };
      const user2 = { id: '456', email: 'user2@example.com' };
      
      const token1 = createToken(user1, 3600);
      const token2 = createToken(user2, 3600);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('verifies a valid token', () => {
      const user = { id: '123', email: 'test@example.com' };
      const token = createToken(user, 3600);
      
      const verified = verifyToken(token);
      
      expect(verified).toBeDefined();
      expect(verified.id).toBe('123');
      expect(verified.email).toBe('test@example.com');
    });

    it('rejects invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const verified = verifyToken(invalidToken);
      
      expect(verified).toBeNull();
    });

    it('rejects expired token', async () => {
      const user = { id: '123' };
      const token = createToken(user, 1); // 1 second
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const verified = verifyToken(token);
      expect(verified).toBeNull();
    }, 2000);

    it('rejects tampered token', () => {
      const user = { id: '123', email: 'test@example.com' };
      const token = createToken(user, 3600);
      
      // Tamper with token
      const parts = token.split('.');
      const tamperedToken = parts[0] + '.' + parts[1] + '.tampered';
      
      const verified = verifyToken(tamperedToken);
      expect(verified).toBeNull();
    });
  });
});

describe('Auth Utilities - Password Management', () => {
  describe('bcrypt password hashing', () => {
    it('hashes password successfully', () => {
      const password = 'TestPassword123!';
      const hash = bcrypt.hashSync(password, 10);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('creates different hashes for same password', () => {
      const password = 'TestPassword123!';
      const hash1 = bcrypt.hashSync(password, 10);
      const hash2 = bcrypt.hashSync(password, 10);
      
      expect(hash1).not.toBe(hash2); // Salt makes each hash unique
    });

    it('verifies correct password', () => {
      const password = 'TestPassword123!';
      const hash = bcrypt.hashSync(password, 10);
      
      const isValid = bcrypt.compareSync(password, hash);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect password', () => {
      const password = 'TestPassword123!';
      const hash = bcrypt.hashSync(password, 10);
      
      const isValid = bcrypt.compareSync('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('handles empty password', () => {
      const password = '';
      const hash = bcrypt.hashSync(password, 10);
      
      expect(hash).toBeDefined();
      expect(bcrypt.compareSync('', hash)).toBe(true);
      expect(bcrypt.compareSync('anything', hash)).toBe(false);
    });

    it('handles special characters in password', () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = bcrypt.hashSync(password, 10);
      
      const isValid = bcrypt.compareSync(password, hash);
      expect(isValid).toBe(true);
    });

    it('handles unicode characters in password', () => {
      const password = 'Test密码🔐パスワード';
      const hash = bcrypt.hashSync(password, 10);
      
      const isValid = bcrypt.compareSync(password, hash);
      expect(isValid).toBe(true);
    });
  });
});

describe('Auth Utilities - Security', () => {
  it('tokens signed with different secrets are not compatible', () => {
    const user = { id: '123' };
    const token = jwt.sign(user, 'secret1', { expiresIn: 3600 });
    
    // Try to verify with different secret
    try {
      jwt.verify(token, 'secret2');
      fail('Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('JsonWebTokenError');
    }
  });

  it('token payload is readable without verification', () => {
    const user = { id: '123', email: 'test@example.com' };
    const token = createToken(user, 3600);
    
    const decoded = jwt.decode(token);
    expect(decoded.id).toBe('123');
    expect(decoded.email).toBe('test@example.com');
    // Note: decode doesn't verify signature, just reads payload
  });

  it('password hash cannot be reversed', () => {
    const password = 'TestPassword123!';
    const hash = bcrypt.hashSync(password, 10);
    
    // There's no way to get original password from hash
    // This test just confirms hash doesn't contain plaintext
    expect(hash.includes(password)).toBe(false);
  });
});
