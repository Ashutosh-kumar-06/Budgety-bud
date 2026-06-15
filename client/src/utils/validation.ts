/**
 * Shared validation helpers used across Login, Signup, and Change Password.
 * Mirrors the rules enforced by the backend (server/src/utils/validators.ts).
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates a general email address format (user@domain.tld).
 * Not restricted to any specific provider.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Enforces a strong password policy:
 *  - at least 8 characters
 *  - at least one uppercase letter
 *  - at least one lowercase letter
 *  - at least one number
 *  - at least one special character
 *
 * Returns an error message string if invalid, or null if the password is valid.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  return null
}

/** User-facing hint describing the password policy, for use under password fields. */
export const PASSWORD_REQUIREMENTS_HINT =
  'At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character.'