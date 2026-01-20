import { describe, it, expect, vi } from 'vitest';
import {
  validators,
  asyncValidators,
  validateField,
  validateForm,
  validateFieldAsync,
  createDebouncedValidator,
  validateFieldAsyncWithError,
  createDebouncedValidatorWithError,
  type AsyncValidationResult,
} from './validators';

describe('validators', () => {
  describe('required', () => {
    const rule = validators.required();

    it('빈 문자열은 실패', () => {
      expect(rule.validate('')).toBe(false);
      expect(rule.validate('   ')).toBe(false);
    });

    it('null/undefined는 실패', () => {
      expect(rule.validate(null)).toBe(false);
      expect(rule.validate(undefined)).toBe(false);
    });

    it('값이 있으면 성공', () => {
      expect(rule.validate('hello')).toBe(true);
      expect(rule.validate(0)).toBe(true);
      expect(rule.validate(false)).toBe(true);
    });

    it('빈 배열은 실패', () => {
      expect(rule.validate([])).toBe(false);
    });

    it('요소가 있는 배열은 성공', () => {
      expect(rule.validate([1, 2, 3])).toBe(true);
    });
  });

  describe('email', () => {
    const rule = validators.email();

    it('유효한 이메일은 성공', () => {
      expect(rule.validate('test@example.com')).toBe(true);
      expect(rule.validate('user.name@domain.co.kr')).toBe(true);
    });

    it('유효하지 않은 이메일은 실패', () => {
      expect(rule.validate('invalid')).toBe(false);
      expect(rule.validate('invalid@')).toBe(false);
      expect(rule.validate('@domain.com')).toBe(false);
      expect(rule.validate('user@domain')).toBe(false);
    });

    it('빈 값은 성공 (required와 함께 사용)', () => {
      expect(rule.validate('')).toBe(true);
    });

    // RFC 5322 강화된 이메일 검증 테스트
    describe('RFC 5322 준수 검증', () => {
      it('TLD가 1자인 이메일은 실패 (RFC 5322 위반)', () => {
        expect(rule.validate('user@domain.c')).toBe(false);
        expect(rule.validate('a@b.c')).toBe(false);
      });

      it('TLD가 2자 이상인 이메일은 성공', () => {
        expect(rule.validate('user@domain.co')).toBe(true);
        expect(rule.validate('user@domain.io')).toBe(true);
        expect(rule.validate('user@domain.com')).toBe(true);
        expect(rule.validate('user@domain.museum')).toBe(true);
      });

      it('RFC 5322 허용 특수문자 포함 이메일 성공', () => {
        expect(rule.validate('user+tag@example.com')).toBe(true);
        expect(rule.validate('user.name@example.com')).toBe(true);
        expect(rule.validate("user!#$%&'*+/=?^_`{|}~-@example.com")).toBe(true);
      });

      it('연속된 도메인 레이블 검증', () => {
        expect(rule.validate('user@sub.domain.co.kr')).toBe(true);
        expect(rule.validate('user@a.b.c.example.com')).toBe(true);
      });

      it('도메인이 하이픈으로 시작/끝나면 실패', () => {
        expect(rule.validate('user@-example.com')).toBe(false);
      });

      it('숫자만 있는 도메인 레이블 허용', () => {
        expect(rule.validate('user@123.example.com')).toBe(true);
      });
    });
  });

  describe('minLength', () => {
    const rule = validators.minLength(5);

    it('최소 길이 이상이면 성공', () => {
      expect(rule.validate('hello')).toBe(true);
      expect(rule.validate('hello world')).toBe(true);
    });

    it('최소 길이 미만이면 실패', () => {
      expect(rule.validate('hi')).toBe(false);
    });

    it('빈 값은 성공', () => {
      expect(rule.validate('')).toBe(true);
    });
  });

  describe('maxLength', () => {
    const rule = validators.maxLength(10);

    it('최대 길이 이하이면 성공', () => {
      expect(rule.validate('hello')).toBe(true);
      expect(rule.validate('0123456789')).toBe(true);
    });

    it('최대 길이 초과하면 실패', () => {
      expect(rule.validate('hello world!')).toBe(false);
    });
  });

  describe('min', () => {
    const rule = validators.min(10);

    it('최소값 이상이면 성공', () => {
      expect(rule.validate(10)).toBe(true);
      expect(rule.validate(100)).toBe(true);
    });

    it('최소값 미만이면 실패', () => {
      expect(rule.validate(5)).toBe(false);
    });
  });

  describe('max', () => {
    const rule = validators.max(100);

    it('최대값 이하이면 성공', () => {
      expect(rule.validate(100)).toBe(true);
      expect(rule.validate(50)).toBe(true);
    });

    it('최대값 초과하면 실패', () => {
      expect(rule.validate(101)).toBe(false);
    });
  });

  describe('pattern', () => {
    const rule = validators.pattern(/^[A-Z]+$/, '대문자만 허용');

    it('패턴에 맞으면 성공', () => {
      expect(rule.validate('ABC')).toBe(true);
    });

    it('패턴에 안 맞으면 실패', () => {
      expect(rule.validate('abc')).toBe(false);
      expect(rule.validate('123')).toBe(false);
    });
  });

  describe('phone (Korean)', () => {
    const rule = validators.phone();

    it('유효한 한국 전화번호는 성공', () => {
      expect(rule.validate('01012345678')).toBe(true);
      expect(rule.validate('010-1234-5678')).toBe(true);
      expect(rule.validate('011-123-4567')).toBe(true);
    });

    it('유효하지 않은 전화번호는 실패', () => {
      expect(rule.validate('02-1234-5678')).toBe(false);
      expect(rule.validate('12345678')).toBe(false);
    });
  });

  describe('password', () => {
    const rule = validators.password();

    it('강력한 비밀번호는 성공', () => {
      expect(rule.validate('Password1!')).toBe(true);
      expect(rule.validate('Abcd1234@')).toBe(true);
    });

    it('약한 비밀번호는 실패', () => {
      expect(rule.validate('password')).toBe(false); // 숫자, 특수문자 없음
      expect(rule.validate('password1')).toBe(false); // 특수문자 없음
      expect(rule.validate('Pass1!')).toBe(false); // 8자 미만
    });
  });

  describe('confirmPassword', () => {
    it('비밀번호가 일치하면 성공', () => {
      const password = 'MyPassword123!';
      const rule = validators.confirmPassword(() => password);
      expect(rule.validate(password)).toBe(true);
    });

    it('비밀번호가 불일치하면 실패', () => {
      const rule = validators.confirmPassword(() => 'MyPassword123!');
      expect(rule.validate('DifferentPassword!')).toBe(false);
    });
  });

  describe('match', () => {
    it('값이 일치하면 성공', () => {
      const rule = validators.match(() => 'expected');
      expect(rule.validate('expected')).toBe(true);
    });

    it('값이 불일치하면 실패', () => {
      const rule = validators.match(() => 'expected');
      expect(rule.validate('different')).toBe(false);
    });
  });
});

describe('validateField', () => {
  it('모든 규칙을 통과하면 null 반환', () => {
    const rules = [validators.required(), validators.minLength(3)];
    expect(validateField('hello', rules)).toBeNull();
  });

  it('첫 번째 실패한 규칙의 메시지 반환', () => {
    const rules = [validators.required(), validators.minLength(10)];
    expect(validateField('hi', rules)).toBe('최소 10자 이상 입력해주세요');
  });
});

describe('validateForm', () => {
  it('모든 필드 검증', () => {
    const values = {
      name: '',
      email: 'invalid',
      age: 15,
    };

    const schema = {
      name: [validators.required()],
      email: [validators.email()],
      age: [validators.min(18, '18세 이상이어야 합니다')],
    };

    const errors = validateForm(values, schema);

    expect(errors.name).toBe('필수 입력 항목입니다');
    expect(errors.email).toBe('올바른 이메일 형식이 아닙니다');
    expect(errors.age).toBe('18세 이상이어야 합니다');
  });

  it('유효한 데이터는 모두 null', () => {
    const values = {
      name: 'John',
      email: 'john@example.com',
    };

    const schema = {
      name: [validators.required()],
      email: [validators.email()],
    };

    const errors = validateForm(values, schema);

    expect(errors.name).toBeNull();
    expect(errors.email).toBeNull();
  });
});

describe('asyncValidators', () => {
  describe('unique', () => {
    it('사용 가능하면 성공', async () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      const rule = asyncValidators.unique(checkFn, '이미 사용 중입니다');

      const isValid = await rule.validate('newUsername');

      expect(isValid).toBe(true);
      expect(checkFn).toHaveBeenCalledWith('newUsername');
    });

    it('중복이면 실패', async () => {
      const checkFn = vi.fn().mockResolvedValue(false);
      const rule = asyncValidators.unique(checkFn, '이미 사용 중입니다');

      const isValid = await rule.validate('existingUsername');

      expect(isValid).toBe(false);
    });
  });
});

describe('validateFieldAsync', () => {
  it('비동기 검증 성공', async () => {
    const rules = [
      asyncValidators.custom(async () => true, '에러'),
    ];

    const error = await validateFieldAsync('value', rules);
    expect(error).toBeNull();
  });

  it('비동기 검증 실패', async () => {
    const rules = [
      asyncValidators.custom(async () => false, '검증 실패'),
    ];

    const error = await validateFieldAsync('value', rules);
    expect(error).toBe('검증 실패');
  });
});

describe('createDebouncedValidator', () => {
  it('디바운스된 검증기 생성', async () => {
    vi.useFakeTimers();

    const rule = asyncValidators.custom(
      async (value: string) => value.length > 3,
      '3자 이상 필요',
      100
    );

    const debouncedValidator = createDebouncedValidator(rule, 100);

    const promise = debouncedValidator('hi');

    // 타이머 진행
    vi.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toBe('3자 이상 필요');

    vi.useRealTimers();
  });
});

describe('validateFieldAsyncWithError', () => {
  it('검증 성공 시 valid: true 반환', async () => {
    const rules = [
      asyncValidators.custom(async () => true, '에러'),
    ];

    const result = await validateFieldAsyncWithError('value', rules);
    expect(result).toEqual({ valid: true });
  });

  it('검증 실패 시 valid: false와 에러 정보 반환', async () => {
    const rules = [
      asyncValidators.custom(async () => false, '검증 실패'),
    ];

    const result = await validateFieldAsyncWithError('value', rules);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toBe('검증 실패');
      expect(result.error.isExecutionError).toBe(false);
    }
  });

  it('실행 에러 발생 시 isExecutionError: true 반환', async () => {
    const rules = [
      asyncValidators.custom(async () => {
        throw new Error('서버 연결 실패');
      }, '검증 실패'),
    ];

    const result = await validateFieldAsyncWithError('value', rules);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toContain('검증 중 오류가 발생했습니다');
      expect(result.error.message).toContain('서버 연결 실패');
      expect(result.error.isExecutionError).toBe(true);
    }
  });

  it('비 Error 객체 throw 시에도 에러 처리', async () => {
    const rules = [
      asyncValidators.custom(async () => {
        throw 'string error';
      }, '검증 실패'),
    ];

    const result = await validateFieldAsyncWithError('value', rules);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toBe('검증 중 오류가 발생했습니다');
      expect(result.error.isExecutionError).toBe(true);
    }
  });
});

describe('createDebouncedValidatorWithError', () => {
  it('디바운스된 검증 성공', async () => {
    vi.useFakeTimers();

    const rule = asyncValidators.custom(
      async (value: string) => value.length > 3,
      '3자 이상 필요',
      100
    );

    const debouncedValidator = createDebouncedValidatorWithError(rule, 100);

    const promise = debouncedValidator('hello');

    vi.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toEqual({ valid: true });

    vi.useRealTimers();
  });

  it('디바운스된 검증 실패', async () => {
    vi.useFakeTimers();

    const rule = asyncValidators.custom(
      async (value: string) => value.length > 3,
      '3자 이상 필요',
      100
    );

    const debouncedValidator = createDebouncedValidatorWithError(rule, 100);

    const promise = debouncedValidator('hi');

    vi.advanceTimersByTime(100);

    const result = await promise;
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toBe('3자 이상 필요');
      expect(result.error.isExecutionError).toBe(false);
    }

    vi.useRealTimers();
  });

  it('디바운스된 실행 에러 처리', async () => {
    vi.useFakeTimers();

    const rule = asyncValidators.custom(
      async () => {
        throw new Error('네트워크 오류');
      },
      '검증 실패',
      100
    );

    const debouncedValidator = createDebouncedValidatorWithError(rule, 100);

    const promise = debouncedValidator('value');

    vi.advanceTimersByTime(100);

    const result = await promise;
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toContain('네트워크 오류');
      expect(result.error.isExecutionError).toBe(true);
    }

    vi.useRealTimers();
  });

  it('연속 호출 시 마지막 호출만 실행', async () => {
    vi.useFakeTimers();

    const validateFn = vi.fn().mockResolvedValue(true);
    const rule = asyncValidators.custom(validateFn, '에러', 100);

    const debouncedValidator = createDebouncedValidatorWithError(rule, 100);

    // 연속 호출
    debouncedValidator('a');
    debouncedValidator('ab');
    const lastPromise = debouncedValidator('abc');

    vi.advanceTimersByTime(100);

    await lastPromise;

    // 마지막 호출만 실행됨
    expect(validateFn).toHaveBeenCalledTimes(1);
    expect(validateFn).toHaveBeenCalledWith('abc');

    vi.useRealTimers();
  });
});
