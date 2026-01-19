/**
 * useToggle - Boolean toggle state hook
 */

import { useState, useCallback } from 'react';

export interface UseToggleReturn {
  /** Current value */
  value: boolean;
  /** Toggle the value */
  toggle: () => void;
  /** Set to true */
  setTrue: () => void;
  /** Set to false */
  setFalse: () => void;
  /** Set to specific value */
  setValue: (value: boolean) => void;
}

export function useToggle(initialValue = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
}

/**
 * useDisclosure - Alias for useToggle with semantic naming (for modals, drawers, etc.)
 */
export function useDisclosure(initialValue = false) {
  const { value: isOpen, setTrue: open, setFalse: close, toggle } = useToggle(initialValue);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
