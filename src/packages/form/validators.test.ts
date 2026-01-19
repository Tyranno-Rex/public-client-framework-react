import { describe, it, expect, vi } from 'vitest';
import {
  validators,
  asyncValidators,
  validateField,
  validateForm,
  validateFieldAsync,
  createDebouncedValidator,
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
