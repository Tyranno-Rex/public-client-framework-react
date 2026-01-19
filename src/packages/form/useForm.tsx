/**
 * useForm - Form state management hook
 */

import { useState, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import { validateField, validateForm, type ValidationRule, type ValidationSchema } from './validators';

export interface FieldError {
  message: string;
}

export interface FormState<T> {
  /** Current form values */
  values: T;
  /** Field errors */
  errors: Partial<Record<keyof T, string | null>>;
  /** Touched fields */
  touched: Partial<Record<keyof T, boolean>>;
  /** Form is submitting */
  isSubmitting: boolean;
  /** Form has been submitted at least once */
  isSubmitted: boolean;
  /** Form is valid */
  isValid: boolean;
  /** Form has changes from initial values */
  isDirty: boolean;
}

export interface FormConfig<T> {
  /** Initial form values */
  initialValues: T;
  /** Validation schema */
  validationSchema?: ValidationSchema<T>;
  /** Validate on change */
  validateOnChange?: boolean;
  /** Validate on blur */
  validateOnBlur?: boolean;
  /** Submit handler */
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface FormActions<T> {
  /** Set a field value */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Set multiple values */
  setValues: (values: Partial<T>) => void;
  /** Set a field error */
  setError: (field: keyof T, error: string | null) => void;
  /** Set multiple errors */
  setErrors: (errors: Partial<Record<keyof T, string | null>>) => void;
  /** Mark field as touched */
  setTouched: (field: keyof T, touched?: boolean) => void;
  /** Validate a specific field */
  validateField: (field: keyof T) => string | null;
  /** Validate all fields */
  validate: () => boolean;
  /** Handle form submission */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  /** Reset form to initial values */
  reset: (newValues?: T) => void;
  /** Get field props for binding */
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    name: string;
  };
  /** Register a field with validation rules */
  register: (field: keyof T, rules?: ValidationRule<T[keyof T]>[]) => {
    value: T[keyof T];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    name: string;
    error?: string;
  };
}

export function useForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): FormState<T> & FormActions<T> {
  const {
    initialValues,
    validationSchema = {},
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
  } = config;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string | null>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldRules, setFieldRules] = useState<Partial<Record<keyof T, ValidationRule<unknown>[]>>>({});

  // Computed states
  const isValid = useMemo(() => {
    return Object.values(errors).every((error) => !error);
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Actions
  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));

    if (validateOnChange) {
      const fieldKey = field as string;
      const rules = (fieldRules as Record<string, ValidationRule<unknown>[]>)[fieldKey] || (validationSchema as Record<string, ValidationRule<unknown>[]>)[fieldKey];
      if (rules) {
        const error = validateField(value, rules);
        setErrorsState((prev) => ({ ...prev, [field]: error }));
      }
    }
  }, [validateOnChange, validationSchema, fieldRules]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, error: string | null) => {
    setErrorsState((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string | null>>) => {
    setErrorsState((prev) => ({ ...prev, ...newErrors }));
  }, []);

  const setTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouchedState((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const validateFieldAction = useCallback((field: keyof T): string | null => {
    const fieldKey = field as string;
    const rules = (fieldRules as Record<string, ValidationRule<unknown>[]>)[fieldKey] || (validationSchema as Record<string, ValidationRule<unknown>[]>)[fieldKey];
    if (!rules) return null;

    const error = validateField(values[field], rules);
    setErrorsState((prev) => ({ ...prev, [field]: error }));
    return error;
  }, [values, validationSchema, fieldRules]);

  const validate = useCallback((): boolean => {
    const mergedSchema: Record<string, ValidationRule<unknown>[]> = { ...(validationSchema as Record<string, ValidationRule<unknown>[]>) };
    for (const [field, rules] of Object.entries(fieldRules)) {
      if (rules) {
        mergedSchema[field] = rules;
      }
    }

    const newErrors = validateForm(values, mergedSchema as ValidationSchema<T>);
    setErrorsState(newErrors);
    return Object.values(newErrors).every((error) => !error);
  }, [values, validationSchema, fieldRules]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    setIsSubmitted(true);

    if (!validate()) {
      return;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validate, onSubmit, values]);

  const reset = useCallback((newValues?: T) => {
    setValuesState(newValues || initialValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitted(false);
  }, [initialValues]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setValue(field, value as T[keyof T]);
    },
    onBlur: () => {
      setTouched(field, true);
      if (validateOnBlur) {
        validateFieldAction(field);
      }
    },
    name: String(field),
  }), [values, setValue, setTouched, validateOnBlur, validateFieldAction]);

  const register = useCallback((field: keyof T, rules?: ValidationRule<T[keyof T]>[]) => {
    if (rules) {
      setFieldRules((prev) => ({ ...prev, [field]: rules }));
    }

    return {
      ...getFieldProps(field),
      error: touched[field] || isSubmitted ? errors[field] || undefined : undefined,
    };
  }, [getFieldProps, touched, isSubmitted, errors]);

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    isValid,
    isDirty,
    // Actions
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    validateField: validateFieldAction,
    validate,
    handleSubmit,
    reset,
    getFieldProps,
    register,
  };
}

// Form Context for nested components
interface FormContextValue<T> extends FormState<T>, FormActions<T> {}

const FormContext = createContext<FormContextValue<Record<string, unknown>> | null>(null);

export function FormProvider<T extends Record<string, unknown>>({
  children,
  form,
}: {
  children: ReactNode;
  form: FormState<T> & FormActions<T>;
}) {
  return (
    <FormContext.Provider value={form as unknown as FormContextValue<Record<string, unknown>>}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext<T extends Record<string, unknown>>(): FormState<T> & FormActions<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context as unknown as FormState<T> & FormActions<T>;
}
