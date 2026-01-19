/**
 * useKeyPress Hook - Keyboard event handling
 */

import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface UseKeyPressOptions {
  target?: EventTarget;
  event?: 'keydown' | 'keyup' | 'keypress';
  preventDefault?: boolean;
}

export function useKeyPress(
  key: string | string[],
  handler: KeyHandler,
  options: UseKeyPressOptions = {}
): void {
  const {
    target = typeof window !== 'undefined' ? window : null,
    event = 'keydown',
    preventDefault = false,
  } = options;

  const handleKeyPress = useCallback(
    (e: Event) => {
      const keyboardEvent = e as KeyboardEvent;
      const keys = Array.isArray(key) ? key : [key];

      if (keys.includes(keyboardEvent.key)) {
        if (preventDefault) {
          keyboardEvent.preventDefault();
        }
        handler(keyboardEvent);
      }
    },
    [key, handler, preventDefault]
  );

  useEffect(() => {
    if (!target) return;

    target.addEventListener(event, handleKeyPress);
    return () => target.removeEventListener(event, handleKeyPress);
  }, [target, event, handleKeyPress]);
}

// Convenience hook for Escape key
export function useEscapeKey(handler: KeyHandler): void {
  useKeyPress('Escape', handler);
}

// Convenience hook for Enter key
export function useEnterKey(handler: KeyHandler): void {
  useKeyPress('Enter', handler);
}

export default useKeyPress;
