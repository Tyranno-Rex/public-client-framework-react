/**
 * I18nContext - Internationalization context and hooks
 */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

export type Locale = 'ko' | 'en' | 'ja' | 'zh';

export type TranslationResources = {
  [locale in Locale]?: {
    [namespace: string]: {
      [key: string]: string;
    };
  };
};

interface I18nContextValue {
  /** Current locale */
  locale: Locale;
  /** Change locale */
  setLocale: (locale: Locale) => void;
  /** Translate a key */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Get all available locales */
  locales: Locale[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

// Default translations
const defaultResources: TranslationResources = {
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
      cancel: '취소',
      confirm: '확인',
      save: '저장',
      delete: '삭제',
      edit: '수정',
      search: '검색',
      noResults: '결과가 없습니다',
      back: '뒤로',
      next: '다음',
      prev: '이전',
    },
    auth: {
      login: '로그인',
      logout: '로그아웃',
      signup: '회원가입',
      email: '이메일',
      password: '비밀번호',
      forgotPassword: '비밀번호 찾기',
    },
    validation: {
      required: '필수 입력 항목입니다',
      invalidEmail: '올바른 이메일 형식이 아닙니다',
      minLength: '최소 {{min}}자 이상 입력해주세요',
      maxLength: '최대 {{max}}자까지 입력 가능합니다',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      noResults: 'No results found',
      back: 'Back',
      next: 'Next',
      prev: 'Previous',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password',
    },
    validation: {
      required: 'This field is required',
      invalidEmail: 'Invalid email format',
      minLength: 'Minimum {{min}} characters required',
      maxLength: 'Maximum {{max}} characters allowed',
    },
  },
};

export interface I18nProviderProps {
  children: ReactNode;
  /** Initial locale */
  defaultLocale?: Locale;
  /** Custom translation resources */
  resources?: TranslationResources;
  /** Persist locale to localStorage */
  persist?: boolean;
}

const STORAGE_KEY = 'app-locale';

function getStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['ko', 'en', 'ja', 'zh'].includes(stored)) {
      return stored as Locale;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

function getBrowserLocale(): Locale {
  const lang = navigator.language.split('-')[0];
  if (['ko', 'en', 'ja', 'zh'].includes(lang)) {
    return lang as Locale;
  }
  return 'ko';
}

export function I18nProvider({
  children,
  defaultLocale,
  resources = {},
  persist = true,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (persist) {
      const stored = getStoredLocale();
      if (stored) return stored;
    }
    return defaultLocale || getBrowserLocale();
  });

  // Merge resources
  const mergedResources = useMemo(() => {
    const merged: TranslationResources = { ...defaultResources };
    for (const loc of Object.keys(resources) as Locale[]) {
      merged[loc] = {
        ...merged[loc],
        ...resources[loc],
      };
    }
    return merged;
  }, [resources]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
      } catch {
        // localStorage not available
      }
    }
    // Update HTML lang attribute
    document.documentElement.lang = newLocale;
  }, [persist]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    // Parse namespace:key format
    const [namespace, translationKey] = key.includes(':')
      ? key.split(':')
      : ['common', key];

    // Get translation
    const translations = mergedResources[locale]?.[namespace];
    let text = translations?.[translationKey] || key;

    // Replace parameters
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      }
    }

    return text;
  }, [locale, mergedResources]);

  const value: I18nContextValue = useMemo(() => ({
    locale,
    setLocale,
    t,
    locales: ['ko', 'en', 'ja', 'zh'] as Locale[],
  }), [locale, setLocale, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

/** Shorthand hook for translation function */
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}
