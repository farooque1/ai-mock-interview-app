/**
 * Reusable Custom Hooks
 * 
 * Business logic extracted into custom hooks:
 * - useTimer - Timer/countdown functionality
 * - useDebounce - Debounce values
 * - useLocalStorage - Persist state to localStorage
 * - usePrevious - Track previous value
 * - useAsync - Handle async operations
 * - useBoolean - Toggle boolean state
 * - useArray - Array manipulation utilities
 * - useObject - Object manipulation utilities
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// TIMER HOOK
// ============================================================================

/**
 * useTimer - Countdown timer functionality
 *
 * @example
 * const { seconds, isRunning, start, stop, reset } = useTimer(60);
 */
export function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  return {
    seconds,
    isRunning,
    start,
    stop,
    reset,
    progress: (initialSeconds - seconds) / initialSeconds,
  };
}

// ============================================================================
// DEBOUNCE HOOK
// ============================================================================

/**
 * useDebounce - Debounce a value
 *
 * @example
 * const debouncedValue = useDebounce(searchTerm, 500);
 */
export function useDebounce<T>(value: T, delayMs: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}

// ============================================================================
// LOCAL STORAGE HOOK
// ============================================================================

/**
 * useLocalStorage - Persist state to localStorage
 *
 * @example
 * const [name, setName] = useLocalStorage('name', 'John');
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (globalThis.window === undefined) {
        return initialValue;
      }

      const item = globalThis.window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = typeof value === 'function' ? (value as (val: T) => T)(storedValue) : value;
        setStoredValue(valueToStore);

        if (globalThis.window !== undefined) {
          globalThis.window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error storing value for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

// ============================================================================
// PREVIOUS VALUE HOOK
// ============================================================================

/**
 * usePrevious - Track previous value using a state-based approach
 * Note: This hook captures the previous value after render
 *
 * @example
 * const prevCount = usePrevious(count);
 */
export function usePrevious<T>(value: T): T | undefined {
  const [state, setState] = useState<{ prev: T | undefined; current: T }>({
    prev: undefined,
    current: value,
  });

  if (state.current !== value) {
    setState({
      prev: state.current,
      current: value,
    });
  }

  return state.prev;
}

// ============================================================================
// ASYNC HOOK
// ============================================================================

/**
 * useAsync - Handle async operations
 *
 * @example
 * const { data, loading, error } = useAsync(() => fetch('/api/data'));
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      setStatus('success');
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      void (async () => {
        try {
          await execute();
        } catch (err) {
          console.error('Async function failed:', err);
        }
      })();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === 'pending',
    isError: status === 'error',
    isSuccess: status === 'success',
  };
}

// ============================================================================
// BOOLEAN HOOK
// ============================================================================

/**
 * useBoolean - Toggle boolean state
 *
 * @example
 * const { value, toggle, setTrue, setFalse } = useBoolean(false);
 */
export function useBoolean(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse, setValue };
}

// ============================================================================
// ARRAY HOOK
// ============================================================================

/**
 * useArray - Array manipulation utilities
 *
 * @example
 * const { array, push, remove, clear } = useArray([1, 2, 3]);
 */
export function useArray<T>(initialArray: T[] = []) {
  const [array, setArray] = useState(initialArray);

  const push = useCallback((item: T) => {
    setArray((prev) => [...prev, item]);
  }, []);

  const remove = useCallback((index: number) => {
    setArray((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => {
    setArray([]);
  }, []);

  const map = useCallback(
    (callback: (item: T, index: number) => T) => {
      setArray((prev) => prev.map(callback));
    },
    []
  );

  const filter = useCallback((predicate: (item: T) => boolean) => {
    setArray((prev) => prev.filter(predicate));
  }, []);

  const sort = useCallback((compareFn?: (a: T, b: T) => number) => {
    setArray((prev) => [...prev].sort(compareFn));
  }, []);

  return {
    array,
    setArray,
    push,
    remove,
    clear,
    map,
    filter,
    sort,
    length: array.length,
    isEmpty: array.length === 0,
  };
}

// ============================================================================
// OBJECT HOOK
// ============================================================================

/**
 * useObject - Object manipulation utilities
 *
 * @example
 * const { object, set, remove, merge } = useObject({ name: 'John' });
 */
export function useObject<T extends Record<string, unknown>>(initialObject: T) {
  const [object, setObject] = useState(initialObject);

  const set = useCallback((key: keyof T, value: unknown) => {
    setObject((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const remove = useCallback((key: keyof T) => {
    setObject((prev) => {
      const newObj = { ...prev };
      delete newObj[key];
      return newObj;
    });
  }, []);

  const merge = useCallback((updates: Partial<T>) => {
    setObject((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const clear = useCallback(() => {
    setObject({} as T);
  }, []);

  return {
    object,
    setObject,
    set,
    remove,
    merge,
    clear,
    keys: Object.keys(object),
    values: Object.values(object),
    isEmpty: Object.keys(object).length === 0,
  };
}

// ============================================================================
// FORM HOOK
// ============================================================================

/**
 * useForm - Simplified form state management
 *
 * @example
 * const { values, handleChange, handleSubmit, reset } = useForm(
 *   { email: '', password: '' },
 *   (values) => console.log('Submit:', values)
 * );
 */
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => void | Promise<void>
) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, type, value } = e.target;

      setValues((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return {
    values,
    setValues,
    handleChange,
    handleSubmit,
    reset,
    isSubmitting,
  };
}

// ============================================================================
// CLICK OUTSIDE HOOK
// ============================================================================

/**
 * useClickOutside - Detect clicks outside an element
 *
 * @example
 * const ref = useClickOutside(() => setIsOpen(false));
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [callback]);

  return ref;
}

// ============================================================================
// COPY TO CLIPBOARD HOOK
// ============================================================================

/**
 * useCopyToClipboard - Copy text to clipboard
 *
 * @example
 * const { copy, isCopied } = useCopyToClipboard();
 */
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  return { copy, isCopied };
}

// ============================================================================
// MEDIA QUERY HOOK
// ============================================================================

/**
 * useMediaQuery - Check if media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (globalThis.window === undefined) return false;
    return globalThis.window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = globalThis.window.matchMedia(query);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', handleChange);

    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

// ============================================================================
// WINDOW SIZE HOOK
// ============================================================================

/**
 * useWindowSize - Get window size
 *
 * @example
 * const { width, height } = useWindowSize();
 */
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// ============================================================================
// FETCH HOOK
// ============================================================================

/**
 * useFetch - Simplified data fetching hook
 *
 * @example
 * const { data, loading, error } = useFetch('/api/data');
 */
export function useFetch<T = unknown>(
  url: string,
  options?: RequestInit & { refetchInterval?: number }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { refetchInterval, ...fetchOptions } = options ?? {};

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }

    return () => {
      isMounted = false;
    };
  }, [url, fetchOptions, refetchInterval]);

  return { data, loading, error };
}
