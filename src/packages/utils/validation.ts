/**
 * Validation Utilities - Form validation helpers
 */

// Validation result
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// Validators
export const validators = {
  // Required field
  required: (value: unknown, message = '필수 입력 항목입니다'): ValidationResult => ({
    valid: value !== null && value !== undefined && value !== '',
    message,
  }),

  // Email validation
  email: (value: string, message = '올바른 이메일 형식이 아닙니다'): ValidationResult => ({
    valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  // Phone number validation (Korean)
  phone: (value: string, message = '올바른 전화번호 형식이 아닙니다'): ValidationResult => ({
    valid: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(value.replace(/-/g, '')),
    message,
  }),

  // Minimum length
  minLength: (value: string, min: number, message?: string): ValidationResult => ({
    valid: value.length >= min,
    message: message ?? `최소 ${min}자 이상 입력해주세요`,
  }),

  // Maximum length
  maxLength: (value: string, max: number, message?: string): ValidationResult => ({
    valid: value.length <= max,
    message: message ?? `최대 ${max}자까지 입력 가능합니다`,
  }),

  // Pattern match
  pattern: (value: string, pattern: RegExp, message = '올바른 형식이 아닙니다'): ValidationResult => ({
    valid: pattern.test(value),
    message,
  }),

  // Number range
  range: (value: number, min: number, max: number, message?: string): ValidationResult => ({
    valid: value >= min && value <= max,
    message: message ?? `${min}에서 ${max} 사이의 값을 입력해주세요`,
  }),

  // Password strength
  password: (value: string, message = '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다'): ValidationResult => ({
    valid: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(value),
    message,
  }),

  // Confirm match
  match: (value: string, compareValue: string, message = '값이 일치하지 않습니다'): ValidationResult => ({
    valid: value === compareValue,
    message,
  }),

  // URL validation
  url: (value: string, message = '올바른 URL 형식이 아닙니다'): ValidationResult => {
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, message };
    }
  },

  // Korean only
  korean: (value: string, message = '한글만 입력 가능합니다'): ValidationResult => ({
    valid: /^[가-힣\s]+$/.test(value),
    message,
  }),

  // No special characters
  noSpecialChars: (value: string, message = '특수문자는 사용할 수 없습니다'): ValidationResult => ({
    valid: /^[a-zA-Z0-9가-힣\s]+$/.test(value),
    message,
  }),
};

// Compose validators
export function validate(
  value: unknown,
  ...rules: ((value: unknown) => ValidationResult)[]
): ValidationResult {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.valid) return result;
  }
  return { valid: true };
}

// Form validation helper
export interface FormErrors {
  [key: string]: string | undefined;
}

export function validateForm<T extends Record<string, unknown>>(
  values: T,
  rules: { [K in keyof T]?: ((value: T[K]) => ValidationResult)[] }
): { valid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};
  let valid = true;

  for (const key in rules) {
    const fieldRules = rules[key];
    if (!fieldRules) continue;

    for (const rule of fieldRules) {
      const result = rule(values[key]);
      if (!result.valid) {
        errors[key] = result.message;
        valid = false;
        break;
      }
    }
  }

  return { valid, errors };
}
