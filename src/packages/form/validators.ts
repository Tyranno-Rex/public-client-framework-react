/**
 * Validators - Form validation utilities
 */

export interface ValidationRule<T = unknown> {
  /** Validation function (sync) */
  validate: (value: T) => boolean;
  /** Error message */
  message: string;
}

/** Async validation rule for server-side checks */
export interface AsyncValidationRule<T = unknown> {
  /** Async validation function */
  validate: (value: T) => Promise<boolean>;
  /** Error message */
  message: string;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export type AsyncValidationSchema<T> = {
  [K in keyof T]?: AsyncValidationRule<T[K]>[];
};

/** Common validators */
export const validators = {
  /** Required field */
  required: (message = '필수 입력 항목입니다'): ValidationRule<unknown> => ({
    validate: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  /** Email format */
  email: (message = '올바른 이메일 형식이 아닙니다'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Use with required() if needed
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  /** Minimum length */
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: message || `최소 ${min}자 이상 입력해주세요`,
  }),

  /** Maximum length */
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: message || `최대 ${max}자까지 입력 가능합니다`,
  }),

  /** Minimum value */
  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value === undefined || value >= min,
    message: message || `${min} 이상의 값을 입력해주세요`,
  }),

  /** Maximum value */
  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value === undefined || value <= max,
    message: message || `${max} 이하의 값을 입력해주세요`,
  }),

  /** Pattern match */
  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => !value || regex.test(value),
    message,
  }),

  /** Phone number (Korean) */
  phone: (message = '올바른 전화번호 형식이 아닙니다'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
      return phoneRegex.test(value.replace(/-/g, ''));
    },
    message,
  }),

  /** Password strength */
  password: (message = '비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      // At least 8 chars, 1 letter, 1 number, 1 special char
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      return passwordRegex.test(value);
    },
    message,
  }),

  /** Match another field */
  match: <T>(getOtherValue: () => T, message = '값이 일치하지 않습니다'): ValidationRule<T> => ({
    validate: (value) => value === getOtherValue(),
    message,
  }),

  /** Custom validator */
  custom: <T>(validate: (value: T) => boolean, message: string): ValidationRule<T> => ({
    validate,
    message,
  }),

  /** Confirm password - cross-field validation */
  confirmPassword: (
    getPassword: () => string,
    message = '비밀번호가 일치하지 않습니다'
  ): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      return value === getPassword();
    },
    message,
  }),
};

/**
 * Async validators - for server-side validation (e.g., duplicate checks)
 */
export const asyncValidators = {
  /**
   * Check uniqueness via API call
   * @param checkFn - API function that returns true if value is available
   * @param message - Error message when value is not available
   * @param debounceMs - Debounce delay (default: 300ms)
   */
  unique: <T>(
    checkFn: (value: T) => Promise<boolean>,
    message: string,
    debounceMs = 300
  ): AsyncValidationRule<T> => ({
    validate: checkFn,
    message,
    debounceMs,
  }),

  /**
   * Custom async validator
   */
  custom: <T>(
    validate: (value: T) => Promise<boolean>,
    message: string,
    debounceMs = 300
  ): AsyncValidationRule<T> => ({
    validate,
    message,
    debounceMs,
  }),
};

/**
 * Create a validation schema
 */
export function createSchema<T extends Record<string, unknown>>(
  schema: ValidationSchema<T>
): ValidationSchema<T> {
  return schema;
}

/**
 * Validate a value against rules
 */
export function validateField<T>(value: T, rules: ValidationRule<T>[]): string | null {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate all fields in a form
 */
export function validateForm<T extends Record<string, unknown>>(
  values: T,
  schema: ValidationSchema<T>
): Record<keyof T, string | null> {
  const errors = {} as Record<keyof T, string | null>;

  for (const key of Object.keys(schema) as (keyof T)[]) {
    const rules = schema[key];
    if (rules) {
      errors[key] = validateField(values[key], rules as ValidationRule<T[keyof T]>[]);
    }
  }

  return errors;
}

/**
 * Validate a single field asynchronously
 */
export async function validateFieldAsync<T>(
  value: T,
  rules: AsyncValidationRule<T>[]
): Promise<string | null> {
  for (const rule of rules) {
    const isValid = await rule.validate(value);
    if (!isValid) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate all fields asynchronously
 */
export async function validateFormAsync<T extends Record<string, unknown>>(
  values: T,
  schema: AsyncValidationSchema<T>
): Promise<Record<keyof T, string | null>> {
  const errors = {} as Record<keyof T, string | null>;
  const keys = Object.keys(schema) as (keyof T)[];

  const results = await Promise.all(
    keys.map(async (key) => {
      const rules = schema[key];
      if (rules) {
        return validateFieldAsync(values[key], rules as AsyncValidationRule<T[keyof T]>[]);
      }
      return null;
    })
  );

  keys.forEach((key, index) => {
    errors[key] = results[index];
  });

  return errors;
}

/**
 * Debounce utility for async validation
 */
export function createDebouncedValidator<T>(
  validator: AsyncValidationRule<T>,
  debounceMs?: number
): (value: T) => Promise<string | null> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<string | null> | null = null;

  const delay = debounceMs ?? validator.debounceMs ?? 300;

  return (value: T): Promise<string | null> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    pendingPromise = new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        try {
          const isValid = await validator.validate(value);
          resolve(isValid ? null : validator.message);
        } catch {
          resolve(null); // On error, don't block - let server handle it
        }
      }, delay);
    });

    return pendingPromise;
  };
}
