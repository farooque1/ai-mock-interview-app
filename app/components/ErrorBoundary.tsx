/**
 * Client-Side Error Boundary
 * 
 * Provides secure error handling for React components:
 * ✅ Catches render errors
 * ✅ Prevents sensitive data exposure
 * ✅ User-friendly error messages
 * ✅ Error logging for debugging
 * ✅ Graceful fallback UI
 */

'use client';

import React, { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Safe error message - doesn't expose internal details
 */
function getSafeErrorMessage(error: Error): string {
  // Check for known safe error messages
  if (error.message.includes('Validation failed')) {
    return 'Invalid input. Please check your data and try again.';
  }

  if (error.message.includes('Unauthorized') || error.message.includes('Auth')) {
    return 'You must be signed in to perform this action.';
  }

  if (error.message.includes('Too many requests') || error.message.includes('Rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (error.message.includes('Network')) {
    return 'Network error. Please check your connection.';
  }

  // Default safe message - never expose internal error details
  return 'Something went wrong. Please try again later.';
}

/**
 * Error logging - safely log errors for debugging
 */
function logErrorSafely(error: Error, context: string): void {
  // Log to console in development only
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${context}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  // In production, could send to error tracking service (e.g., Sentry)
  // Make sure to configure it to not send sensitive user data
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error);
  }
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

/**
 * Error Boundary Component
 * 
 * Catches errors in child components and displays fallback UI
 * 
 * Usage:
 * <ErrorBoundary
 *   onError={(error) => console.error(error)}
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Something went wrong</p>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error safely
    logErrorSafely(error, 'ErrorBoundary caught');

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return (
        <div style={errorBoundaryStyles.container}>
          <div style={errorBoundaryStyles.content}>
            <h2 style={errorBoundaryStyles.title}>⚠️ Something went wrong</h2>
            <p style={errorBoundaryStyles.message}>
              {getSafeErrorMessage(this.state.error)}
            </p>
            <button
              onClick={this.reset}
              style={errorBoundaryStyles.button}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// DEFAULT STYLES
// ============================================================================

const errorBoundaryStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  content: {
    textAlign: 'center' as const,
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#d32f2f',
  },
  message: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

// ============================================================================
// HOOKS FOR SAFE ERROR HANDLING
// ============================================================================

/**
 * Hook to catch and handle errors safely
 * @param callback - Async function that might throw
 * @param onError - Error handler
 */
export function useSafeAsync<T>(
  callback: () => Promise<T>,
  onError?: (error: Error) => void
): {
  execute: () => Promise<T | undefined>;
  isLoading: boolean;
  error: Error | null;
} {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async (): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      setError(null);
      return await callback();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      if (onError) {
        onError(error);
      }

      logErrorSafely(error, 'useSafeAsync');
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [callback, onError]);

  return { execute, isLoading, error };
}

/**
 * Hook for safe DOM operations
 * Prevents XSS by sanitizing HTML
 */
export function useSafeHtml(html: string): { __html: string } {
  return React.useMemo(() => {
    // Basic sanitization - remove script tags and event handlers
    const sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript:/gi, '');

    return { __html: sanitized };
  }, [html]);
}

// ============================================================================
// SAFE TEXT RENDERING
// ============================================================================

/**
 * Safely render user-generated text (prevents XSS)
 */
export const SafeText: React.FC<{ text: string; maxLength?: number }> = ({ text, maxLength = 500 }) => {
  // Escape HTML special characters
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const display = maxLength && escaped.length > maxLength 
    ? escaped.substring(0, maxLength) + '...' 
    : escaped;

  return <span>{display}</span>;
};

// ============================================================================
// SAFE ERROR DISPLAY
// ============================================================================

/**
 * Component to safely display errors without exposing sensitive info
 */
export const SafeErrorDisplay: React.FC<{
  error: unknown;
  title?: string;
  onRetry?: () => void;
}> = ({ error, title = 'An error occurred', onRetry }) => {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const safeMessage = getSafeErrorMessage(errorObj);

  return (
    <div style={errorBoundaryStyles.container}>
      <div style={errorBoundaryStyles.content}>
        <h3 style={errorBoundaryStyles.title}>{title}</h3>
        <p style={errorBoundaryStyles.message}>{safeMessage}</p>
        {onRetry && (
          <button onClick={onRetry} style={errorBoundaryStyles.button}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * EXAMPLES:
 * 
 * 1. WITH ERROR BOUNDARY:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * 
 * 2. WITH CUSTOM FALLBACK:
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Error: {getSafeErrorMessage(error)}</p>
 *       <button onClick={reset}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * 
 * 3. WITH SAFE ASYNC HOOK:
 * export function MyComponent() {
 *   const { execute, isLoading, error } = useSafeAsync(
 *     async () => {
 *       const res = await fetch('/api/data');
 *       return res.json();
 *     },
 *     (error) => console.error('Failed:', error)
 *   );
 * 
 *   return (
 *     <div>
 *       {error && <SafeErrorDisplay error={error} />}
 *       <button onClick={execute} disabled={isLoading}>
 *         {isLoading ? 'Loading...' : 'Load Data'}
 *       </button>
 *     </div>
 *   );
 * }
 * 
 * 4. WITH SAFE TEXT RENDERING:
 * export function UserComment({ text }: { text: string }) {
 *   return <div><SafeText text={text} maxLength={200} /></div>;
 * }
 */
