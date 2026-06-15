/**
 * Shared validation helpers for auth-related endpoints
 * (signup, login, change-password).
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a general email address format (user@domain.tld).
 * Not restricted to any specific provider.
 */
export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Enforces a strong password policy:
 *  - at least 8 characters
 *  - at least one uppercase letter
 *  - at least one lowercase letter
 *  - at least one number
 *  - at least one special character
 */
export function validatePasswordStrength(password: unknown): PasswordValidationResult {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.';