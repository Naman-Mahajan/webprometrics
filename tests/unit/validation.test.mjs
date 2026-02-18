// Unit tests for validation utilities
import { body, validationResult } from 'express-validator';

describe('Input Validation', () => {
  describe('Email Validation', () => {
    it('accepts valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.com',
        'user123@sub.example.co.uk',
        'a@b.c'
      ];

      validEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        'user@',
        '@example.com',
        'user@.com',
        'user@domain',
        'user space@example.com',
        'user@domain .com'
      ];

      invalidEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });

    it('normalizes email addresses', () => {
      const email = '  USER@EXAMPLE.COM  ';
      const normalized = email.trim().toLowerCase();
      
      expect(normalized).toBe('user@example.com');
    });
  });

  describe('Password Validation', () => {
    const validatePassword = (password) => {
      if (!password) return { valid: false, error: 'Password required' };
      if (password.length < 8) return { valid: false, error: 'Too short' };
      if (password.length > 128) return { valid: false, error: 'Too long' };
      return { valid: true };
    };

    it('accepts valid passwords', () => {
      const validPasswords = [
        'Password123!',
        'MySecureP@ssw0rd',
        'a1b2c3d4e5f6g7h8',
        'Test1234'
      ];

      validPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
      });
    });

    it('rejects passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too short');
    });

    it('rejects empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Password required');
    });

    it('rejects very long passwords', () => {
      const longPassword = 'a'.repeat(150);
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too long');
    });
  });

  describe('URL Validation', () => {
    const isValidURL = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    it('accepts valid URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://example.com',
        'https://sub.example.com',
        'https://example.com/path',
        'https://example.com:8080',
        'https://example.com/path?query=value'
      ];

      validURLs.forEach(url => {
        expect(isValidURL(url)).toBe(true);
      });
    });

    it('rejects invalid URLs', () => {
      const invalidURLs = [
        'notaurl',
        'example.com',
        '//example.com'
      ];

      invalidURLs.forEach(url => {
        expect(isValidURL(url)).toBe(false);
      });
    });
  });

  describe('Text Sanitization', () => {
    const escapeHTML = (text) => {
      const map = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return text.replace(/[<>&"']/g, char => map[char]);
    };

    it('escapes HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const escaped = escapeHTML(input);
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(escaped.includes('<script>')).toBe(false);
    });

    it('escapes malicious attributes', () => {
      const input = '<img src=x onerror=alert("xss")>';
      const escaped = escapeHTML(input);
      
      expect(escaped.includes('<img')).toBe(false);
      expect(escaped.includes('onerror')).toBe(true); // Text preserved but escaped
    });

    it('handles normal text without changes', () => {
      const input = 'This is normal text with numbers 123';
      const escaped = escapeHTML(input);
      
      expect(escaped).toBe(input);
    });

    it('trims whitespace', () => {
      const input = '   text with spaces   ';
      const trimmed = input.trim();
      
      expect(trimmed).toBe('text with spaces');
    });
  });

  describe('Number Validation', () => {
    const validateInteger = (value, min, max) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return { valid: false, error: 'Not a number' };
      if (min !== undefined && num < min) return { valid: false, error: 'Too small' };
      if (max !== undefined && num > max) return { valid: false, error: 'Too large' };
      return { valid: true, value: num };
    };

    it('validates positive integers', () => {
      const result = validateInteger('42', 1, 100);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42);
    });

    it('rejects non-numeric input', () => {
      const result = validateInteger('abc', 1, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Not a number');
    });

    it('enforces minimum value', () => {
      const result = validateInteger('5', 10, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too small');
    });

    it('enforces maximum value', () => {
      const result = validateInteger('150', 10, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too large');
    });
  });

  describe('Array Validation', () => {
    it('validates non-empty arrays', () => {
      const arr = [1, 2, 3];
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBeGreaterThan(0);
    });

    it('rejects empty arrays when required', () => {
      const arr = [];
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBe(0);
    });

    it('validates array items', () => {
      const arr = ['item1', 'item2', 'item3'];
      const allStrings = arr.every(item => typeof item === 'string');
      expect(allStrings).toBe(true);
    });
  });
});
