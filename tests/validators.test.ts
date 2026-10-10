// ============================================================================
// Unit Tests — Validators
// ============================================================================
import { describe, it, expect } from 'vitest';
import { validatePhone, validateEmail, phoneSchema, emailSchema } from '../src/lib/validators';

describe('Phone Validation', () => {
  it('validates 10-digit Indian mobile numbers starting with 6, 7, 8, 9', () => {
    expect(validatePhone('9876543210')).toBe(true);
    expect(validatePhone('8888888888')).toBe(true);
    expect(validatePhone('7123456789')).toBe(true);
    expect(validatePhone('6999999999')).toBe(true);
  });

  it('validates numbers with country code prefix +91', () => {
    expect(validatePhone('+91 9876543210')).toBe(true);
    expect(validatePhone('919876543210')).toBe(true);
  });

  it('rejects invalid numbers', () => {
    expect(validatePhone('1234567890')).toBe(false);
    expect(validatePhone('98765')).toBe(false);
    expect(validatePhone('abcdefghij')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('Email Validation', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('athlete.sharma@dynamo.in')).toBe(true);
  });

  it('rejects malformed email strings', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@missinguser.com')).toBe(false);
  });
});
