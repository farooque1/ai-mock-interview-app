/**
 * Reusable API & Data Fetching Utilities
 * 
 * Centralized API calls and data fetching logic:
 * - API request wrapper with error handling
 * - Data fetching hook (useQuery)
 * - Mutation hook (useMutation)
 * - Validation utilities
 * - Error handling utilities
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string | string[]>;
}

export class ApiError extends Error {
  status?: number;
  errors?: Record<string, string | string[]>;

  constructor(message: string, status?: number, errors?: Record<string, string | string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export interface UseQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
}

// ============================================================================
// API HELPER FUNCTIONS
// ============================================================================

/**
 * Create error from API response
 */
function createApiError(
  message: string,
  status?: number,
  errors?: Record<string, string | string[]>
): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.errors = errors;
  return error;
}

/**
 * Generic API request wrapper
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit & { validateStatus?: (status: number) => boolean } = {}
): Promise<ApiResponse<T>> {
  const { validateStatus, ...fetchOptions } = options;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    const data = (await response.json()) as ApiResponse<T>;

    // Check if response is ok or if custom validation passes
    const isOk = validateStatus ? validateStatus(response.status) : response.ok;

    if (!isOk) {
      console.error(`API Error [${response.status}]:`, data);
      throw createApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data.errors
      );
    }

    return data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw createApiError('Invalid JSON response from server');
    }

    if (error instanceof TypeError) {
      throw createApiError('Network error. Please check your connection.');
    }

    throw createApiError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * GET request
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * POST request
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
}

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * useQuery - Hook for fetching data
 *
 * @example
 * const { data, loading, error } = useQuery('/api/interviews', { enabled: true })
 */
export function useQuery<T = unknown>(
  endpoint: string,
  options: UseQueryOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { onSuccess, onError, enabled = true, refetchInterval } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<T>(endpoint);

      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        const err = createApiError(response.error || 'Unknown error');
        setError(err);
        onError?.(err);
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : createApiError(String(err));
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();

    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * useMutation - Hook for POST/PUT/DELETE operations
 *
 * @example
 * const { mutate, loading, error } = useMutation('/api/interviews', { method: 'POST' })
 */
export function useMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options: UseMutationOptions<TData> & { method?: 'POST' | 'PUT' | 'DELETE' } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { onSuccess, onError, onSettled, method = 'POST' } = options;

  const mutate = useCallback(
    async (variables?: TVariables) => {
      setLoading(true);
      setError(null);

      try {
        let response: ApiResponse<TData>;

        if (method === 'POST') {
          response = await apiPost<TData>(endpoint, variables);
        } else if (method === 'PUT') {
          response = await apiPut<TData>(endpoint, variables);
        } else {
          response = await apiDelete<TData>(endpoint);
        }

        if (response.success && response.data) {
          onSuccess?.(response.data);
          return response.data;
        } else {
          const err = createApiError(response.error || 'Unknown error', undefined, response.errors);
          setError(err);
          onError?.(err);
          throw err;
        }
      } catch (err) {
        const apiError = err instanceof ApiError ? err : createApiError(String(err));
        setError(apiError);
        onError?.(apiError);
        throw apiError;
      } finally {
        setLoading(false);
        onSettled?.();
      }
    },
    [endpoint, method, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
}

// ============================================================================
// BATCH REQUEST HELPERS
// ============================================================================

/**
 * Execute multiple requests in parallel
 */
export async function batchRequests<T extends readonly unknown[]>(
  requests: readonly Promise<ApiResponse<unknown>>[]
): Promise<T> {
  try {
    const results = await Promise.all(requests);

    // Check if all succeeded
    const allSucceeded = results.every((r) => r.success);
    if (!allSucceeded) {
      const failed = results.filter((r) => !r.success);
      throw createApiError(`${failed.length} request(s) failed`);
    }

    return results.map((r) => r.data) as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw createApiError(String(error));
  }
}

/**
 * Execute requests sequentially
 */
export async function sequentialRequests<T extends readonly unknown[]>(
  requests: readonly (() => Promise<ApiResponse<unknown>>)[]
): Promise<T> {
  const results: unknown[] = [];

  for (const request of requests) {
    try {
      const result = await request();
      if (!result.success) {
        throw createApiError(result.error || 'Request failed');
      }
      results.push(result.data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw createApiError(String(error));
    }
  }

  return results as unknown as T;
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Retry a request with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2 } = options;

  let lastError: Error | null = null;
  let delay = delayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffMultiplier;
    }
  }

  throw lastError || new Error('Request failed after retries');
}

// ============================================================================
// SPECIFIC API CALL HELPERS
// ============================================================================

/**
 * Generate interview questions
 */
export async function generateInterview(data: {
  jobPosition: string;
  jobDesc: string;
  jobExperience: number;
}) {
  return apiPost('/api/generate', data);
}

/**
 * Get feedback for an answer
 */
export async function generateFeedback(data: {
  mockIdRef: string;
  userAnswer: string;
}) {
  return apiPost('/api/feedback', data);
}

/**
 * Save user answer
 */
export async function saveAnswer(data: {
  mockIdRef: string;
  question: string;
  UserAns: string;
  email: string;
}) {
  return apiPost('/api/save-answer', data);
}

/**
 * Get interview by ID
 */
export async function getInterview(mockId: string) {
  return apiGet(`/api/interviews/${mockId}`);
}

/**
 * Get all interviews for user
 */
export async function getInterviews() {
  return apiGet('/api/interviews');
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private ttl: number; // Time to live in milliseconds

  constructor(ttlMs: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.ttl = ttlMs;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();

/**
 * useQuery with caching
 */
export function useCachedQuery<T = unknown>(
  endpoint: string,
  options: UseQueryOptions<T> = {}
) {
  const cacheKey = `query:${endpoint}`;

  return useQuery<T>(endpoint, {
    ...options,
    onSuccess: (data) => {
      apiCache.set(cacheKey, data);
      options.onSuccess?.(data);
    },
  });
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: ApiError | Error | null): string {
  if (!error) return 'An unknown error occurred';

  const status = (error as Partial<ApiError>).status;

  if (status) {
    if (status === 400) return error.message || 'Invalid input';
    if (status === 401) return 'Please sign in to continue';
    if (status === 403) return 'You do not have permission';
    if (status === 404) return 'Resource not found';
    if (status === 429) return 'Too many requests. Please try again later';
    if (status === 500) return 'Server error. Please try again later';
  }

  return error.message || 'An unknown error occurred';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError | Error): boolean {
  const status = (error as Partial<ApiError>).status;
  if (!status) return true; // Network errors are retryable
  return status === 408 || status === 429 || status >= 500;
}
