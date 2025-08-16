import { describe, it, expect } from 'vitest';
import {
  isEmailFormat,
  isUsernameFormat,
  determineLoginType,
  validateLoginInput,
} from '../validation';

describe('Validation Utils', () => {
  describe('isEmailFormat', () => {
    it('should return true for valid email formats', () => {
      expect(isEmailFormat('test@example.com')).toBe(true);
      expect(isEmailFormat('user.name@domain.co.jp')).toBe(true);
      expect(isEmailFormat('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid email formats', () => {
      expect(isEmailFormat('invalid-email')).toBe(false);
      expect(isEmailFormat('test@')).toBe(false);
      expect(isEmailFormat('@example.com')).toBe(false);
      expect(isEmailFormat('test.example.com')).toBe(false);
      expect(isEmailFormat('')).toBe(false);
    });
  });

  describe('isUsernameFormat', () => {
    it('should return true for valid usernames', () => {
      expect(isUsernameFormat('user123')).toBe(true);
      expect(isUsernameFormat('test_user')).toBe(true);
      expect(isUsernameFormat('user-name')).toBe(true);
      expect(isUsernameFormat('abc')).toBe(true); // minimum 3 chars
      expect(isUsernameFormat('a1234567890123456789')).toBe(true); // 20 chars
    });

    it('should return false for invalid usernames', () => {
      expect(isUsernameFormat('ab')).toBe(false); // too short
      expect(isUsernameFormat('123456789012345678901')).toBe(false); // too long
      expect(isUsernameFormat('user@name')).toBe(false); // invalid character
      expect(isUsernameFormat('user.name')).toBe(false); // invalid character
      expect(isUsernameFormat('user name')).toBe(false); // space
      expect(isUsernameFormat('')).toBe(false);
    });
  });

  describe('determineLoginType', () => {
    it('should correctly identify email addresses', () => {
      expect(determineLoginType('test@example.com')).toBe('email');
      expect(determineLoginType('user.name@domain.co.jp')).toBe('email');
    });

    it('should correctly identify usernames', () => {
      expect(determineLoginType('testuser')).toBe('username');
      expect(determineLoginType('user_123')).toBe('username');
      expect(determineLoginType('test-user')).toBe('username');
    });

    it('should return invalid for invalid inputs', () => {
      expect(determineLoginType('ab')).toBe('invalid'); // too short
      expect(determineLoginType('user@')).toBe('invalid'); // invalid email
      expect(determineLoginType('user name')).toBe('invalid'); // space
      expect(determineLoginType('')).toBe('invalid');
    });
  });

  describe('validateLoginInput', () => {
    it('should validate correct email and password', () => {
      const result = validateLoginInput('test@example.com', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.loginType).toBe('email');
    });

    it('should validate correct username and password', () => {
      const result = validateLoginInput('testuser', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.loginType).toBe('username');
    });

    it('should return errors for empty inputs', () => {
      const result = validateLoginInput('', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('メールアドレスまたはユーザー名を入力してください');
      expect(result.errors).toContain('パスワードを入力してください');
    });

    it('should return error for short password', () => {
      const result = validateLoginInput('testuser', '123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('パスワードは6文字以上で入力してください');
    });

    it('should return error for invalid email/username format', () => {
      const result = validateLoginInput('invalid@', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('有効なメールアドレスまたはユーザー名を入力してください');
      expect(result.loginType).toBe('invalid');
    });

    it('should handle whitespace correctly', () => {
      const result = validateLoginInput('  testuser  ', '  password123  ');
      expect(result.isValid).toBe(true);
      expect(result.loginType).toBe('username');
    });
  });
});