import { useState, useCallback } from 'react';

/**
 * Persists state to localStorage.
 * Falls back to the initial value when the key is missing or corrupted.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setStored(value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Quota exceeded — silently ignore
      }
    },
    [key],
  );

  return [stored, setValue];
}
