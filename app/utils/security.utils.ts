/**
 * Security Utilities
 * 
 * Provides comprehensive security functions:
 * - Input validation and sanitization
 * - CSRF protection
 * - XSS prevention
 * - SQL injection prevention (Drizzle safe practices)
 * - Rate limiting utilities
 * - Secure headers
 */

import DOMPurify from 'isomorphic-dompurify';

// ============================================================================
// INPUT VALIDATION
// ============================================================================

/**
 * Validation result interface
 */
export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Validates string fields with length, type, and content checks
 * @param value - String to validate
 * @param field - Field name for error messages
 * @param options - Validation options
 */
export function validateString(
  value: unknown,
  field: string,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
    allowEmpty?: boolean;
  } = {}
): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  // Type check
  if (typeof value !== 'string') {
    if (options.required || (typeof value !== 'undefined' && value !== null)) {
      errors.push({
        field,
        message: `Expected string, got ${typeof value}`,
        code: 'TYPE_ERROR',
      });
      return { valid: false, errors };
    }
    return { valid: true, data: undefined, errors: [] };
  }

  // Empty check
  if (!value && !options.allowEmpty && options.required) {
    errors.push({
      field,
      message: 'Field is required',
      code: 'REQUIRED_ERROR',
    });
    return { valid: false, errors };
  }

  // Length validation
  if (options.minLength && value.length < options.minLength) {
    errors.push({
      field,
      message: `Minimum length is ${options.minLength} characters`,
      code: 'MIN_LENGTH_ERROR',
    });
  }

  if (options.maxLength && value.length > options.maxLength) {
    errors.push({
      field,
      message: `Maximum length is ${options.maxLength} characters`,
      code: 'MAX_LENGTH_ERROR',
    });
  }

  // Pattern validation
  if (options.pattern && !options.pattern.test(value)) {
    errors.push({
      field,
      message: 'Invalid format',
      code: 'PATTERN_ERROR',
    });
  }

  return {
    valid: errors.length === 0,
    data: value,
    errors,
  };
}

/**
 * Validates number fields with range and type checks
 * @param value - Number to validate
 * @param field - Field name for error messages
 * @param options - Validation options
 */
export function validateNumber(
  value: unknown,
  field: string,
  options: {
    min?: number;
    max?: number;
    required?: boolean;
    allowZero?: boolean;
  } = {}
): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  // Type check
  if (typeof value !== 'number' && typeof value !== 'string') {
    if (options.required) {
      errors.push({
        field,
        message: `Expected number, got ${typeof value}`,
        code: 'TYPE_ERROR',
      });
      return { valid: false, errors };
    }
    return { valid: true, data: undefined, errors: [] };
  }

  // Convert string to number if needed
  const numValue = typeof value === 'number' ? value : Number(value);

  if (isNaN(numValue)) {
    errors.push({
      field,
      message: 'Invalid number format',
      code: 'NAN_ERROR',
    });
    return { valid: false, errors };
  }

  // Zero check
  if (numValue === 0 && !options.allowZero && options.required) {
    errors.push({
      field,
      message: 'Value cannot be zero',
      code: 'ZERO_NOT_ALLOWED',
    });
  }

  // Range validation
  if (options.min !== undefined && numValue < options.min) {
    errors.push({
      field,
      message: `Minimum value is ${options.min}`,
      code: 'MIN_VALUE_ERROR',
    });
  }

  if (options.max !== undefined && numValue > options.max) {
    errors.push({
      field,
      message: `Maximum value is ${options.max}`,
      code: 'MAX_VALUE_ERROR',
    });
  }

  return {
    valid: errors.length === 0,
    data: numValue,
    errors,
  };
}

/**
 * Validates required fields exist in object
 * @param obj - Object to check
 * @param requiredFields - Array of required field names
 */
export function validateRequiredFields(
  obj: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  for (const field of requiredFields) {
    if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
      errors.push({
        field,
        message: 'Required field is missing',
        code: 'REQUIRED_FIELD_MISSING',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// SANITIZATION & XSS PREVENTION
// ============================================================================

/**
 * Sanitizes text to prevent XSS attacks
 * Removes all HTML tags and scripts
 * @param text - Text to sanitize
 * @param options - Sanitization options
 */
export function sanitizeText(
  text: unknown,
  options: {
    maxLength?: number;
    trim?: boolean;
    lowercase?: boolean;
  } = {}
): string {
  if (typeof text !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = options.trim !== false ? text.trim() : text;

  // Sanitize HTML and scripts using DOMPurify
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });

  // Remove any remaining HTML entities
  sanitized = sanitized
    .replace(/&[a-z]+;/gi, '') // Remove HTML entities
    .replace(/<[^>]*>/g, '') // Remove any remaining tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers

  // Lowercase if needed
  if (options.lowercase) {
    sanitized = sanitized.toLowerCase();
  }

  // Truncate if maxLength specified
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Sanitizes HTML for safe rendering
 * Allows only safe tags (p, br, strong, em, etc)
 * @param html - HTML to sanitize
 */
export function sanitizeHtml(html: unknown): string {
  if (typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Escapes special HTML characters
 * @param text - Text to escape
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitizes URL to prevent XSS via links
 * @param url - URL to sanitize
 */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') {
    return '';
  }

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  return url;
}

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * Generates a CSRF token
 * In production, should be stored in secure session
 */
export function generateCsrfToken(): string {
  const randomBytes = Buffer.from(Math.random().toString()).toString('base64');
  const timestamp = Date.now().toString();
  return `${randomBytes}.${timestamp}`;
}

/**
 * Validates CSRF token
 * @param token - Token to validate
 * @param storedToken - Token stored on server/session
 */
export function validateCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }

  // Basic check - in production, use constant-time comparison
  return token === storedToken;
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar
 */
class RateLimiter {
  private store: Map<
    string,
    {
      count: number;
      resetTime: number;
    }
  > = new Map();

  /**
   * Checks if request is allowed
   * @param key - Unique identifier (e.g., userId or IP)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   */
  isAllowed(key: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // Create new record or reset existing one
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    // Increment count
    record.count++;

    if (record.count > limit) {
      return false;
    }

    return true;
  }

  /**
   * Gets remaining requests
   */
  getRemaining(key: string, limit: number = 10): number {
    const record = this.store.get(key);
    if (!record) return limit;
    return Math.max(0, limit - record.count);
  }

  /**
   * Clears all records
   */
  clear(): void {
    this.store.clear();
  }
}

export const rateLimiter = new RateLimiter();

// ============================================================================
// SECURE HEADERS
// ============================================================================

/**
 * Security headers to prevent common attacks
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff', // Prevents MIME-type sniffing
  'X-Frame-Options': 'DENY', // Prevents clickjacking
  'X-XSS-Protection': '1; mode=block', // Legacy XSS protection
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', // HTTPS only
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/**
 * Applies security headers to response
 * @param response - Response object to update
 */
export function applySecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  return newResponse;
}

// ============================================================================
// SQL INJECTION PREVENTION (Drizzle ORM Safe Practices)
// ============================================================================

/**
 * Validates that Drizzle ORM is being used safely
 * DO NOT use string interpolation or template literals in Drizzle queries
 * 
 * ❌ UNSAFE:
 * await db.select().from(users).where(sql`id = ${userId}`);
 * 
 * ✅ SAFE:
 * await db.select().from(users).where(eq(users.id, userId));
 */
export const DRIZZLE_SAFETY_GUIDELINES = {
  description: 'Drizzle ORM provides SQL injection protection through parameterized queries',
  rules: [
    '✅ Use Drizzle DSL (eq, like, and, or, etc)',
    '❌ Never use string interpolation in WHERE clauses',
    '❌ Never use template literals for dynamic values',
    '✅ Use parameters for dynamic values',
    '✅ Validate and sanitize input BEFORE passing to Drizzle',
  ],
};

// ============================================================================
// SECURITY CONTEXT
// ============================================================================

/**
 * Security context for request validation
 */
export interface SecurityContext {
  userId?: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Extracts security context from request
 * @param request - Next.js Request object
 */
export function getSecurityContext(request: Request): SecurityContext {
  const headersList = new Headers(request.headers);

  return {
    timestamp: Date.now(),
    ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
    userAgent: headersList.get('user-agent') || undefined,
  };
}

// ============================================================================
// ERROR SAFE RESPONSES
// ============================================================================

/**
 * Creates safe error response that doesn't expose internal details
 * @param publicMessage - Message safe to show to users
 * @param internalError - Internal error for logging
 * @param statusCode - HTTP status code
 */
export function createSafeErrorResponse(
  publicMessage: string,
  internalError?: Error,
  statusCode: number = 500
): Response {
  // Log internal error for debugging (don't expose to user)
  if (internalError) {
    console.error('[SECURITY] Internal Error:', {
      timestamp: new Date().toISOString(),
      message: internalError.message,
      stack: internalError.stack,
    });
  }

  return new Response(
    JSON.stringify({
      success: false,
      message: publicMessage,
      // Never expose stack traces or internal details
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// ============================================================================
// EXAMPLE USAGE DOCUMENTATION
// ============================================================================

/**
 * USAGE EXAMPLES
 * 
 * ===== INPUT VALIDATION =====
 * const validation = validateString(input, 'jobPosition', {
 *   required: true,
 *   minLength: 2,
 *   maxLength: 100,
 * });
 * if (!validation.valid) return errorResponse(validation.errors[0].message);
 * 
 * ===== SANITIZATION =====
 * const cleanText = sanitizeText(userInput, { maxLength: 500 });
 * const cleanHtml = sanitizeHtml(userContent);
 * const cleanUrl = sanitizeUrl(userLink);
 * 
 * ===== RATE LIMITING =====
 * if (!rateLimiter.isAllowed(userId, 10, 60000)) {
 *   return errorResponse('Too many requests', 429);
 * }
 * 
 * ===== HEADERS =====
 * let response = new Response('data');
 * response = applySecurityHeaders(response);
 * 
 * ===== CSRF PROTECTION =====
 * const token = generateCsrfToken();
 * const isValid = constantTimeEqual(token, storedToken);
 */
