import bcrypt from "bcryptjs";

export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: /[A-Z]/,
  requireLowercase: /[a-z]/,
  requireNumber: /[0-9]/,
  requireSpecial: /[^A-Za-z0-9]/,
};

export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0 to 4
  errors: string[];
}

/**
 * Validates password complexity against enterprise security standards.
 */
export function validatePasswordPolicy(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  } else {
    score += 1;
  }

  if (!PASSWORD_POLICY.requireUppercase.test(password)) {
    errors.push("Password must include at least one uppercase letter (A-Z)");
  } else {
    score += 1;
  }

  if (!PASSWORD_POLICY.requireLowercase.test(password)) {
    errors.push("Password must include at least one lowercase letter (a-z)");
  }

  if (!PASSWORD_POLICY.requireNumber.test(password)) {
    errors.push("Password must include at least one number (0-9)");
  } else {
    score += 1;
  }

  if (!PASSWORD_POLICY.requireSpecial.test(password)) {
    errors.push("Password must include at least one special character (!@#$%^&*...)");
  } else {
    score += 1;
  }

  return {
    valid: errors.length === 0,
    score: Math.min(4, score),
    errors,
  };
}

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies a plaintext password against an existing bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
