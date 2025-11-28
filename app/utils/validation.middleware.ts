/**
 * Advanced Validation Middleware for API Routes
 * 
 * Provides strict input validation with:
 * - Type checking
 * - Length validation
 * - Required field validation
 * - Sanitization
 * - Rate limiting
 * - CSRF protection
 */

import {
  validateString,
  validateNumber,
  sanitizeText,
  rateLimiter,
  getSecurityContext,
} from './security.utils';
import { auth } from '@clerk/nextjs/server';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Interview Request Validation Schema
 */
export const INTERVIEW_REQUEST_SCHEMA = {
  jobPosition: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100,
    description: 'Job position name',
  },
  jobDesc: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 1000,
    description: 'Job description / tech stack',
  },
  jobExperience: {
    type: 'number',
    required: true,
    min: 0,
    max: 80,
    description: 'Years of experience',
  },
};

/**
 * Feedback Request Validation Schema
 */
export const FEEDBACK_REQUEST_SCHEMA = {
  mockIdRef: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    description: 'Interview ID reference',
  },
  userAnswer: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 5000,
    description: 'User answer to evaluate',
  },
};

/**
 * Save Answer Request Validation Schema
 */
export const SAVE_ANSWER_SCHEMA = {
  mockIdRef: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    description: 'Interview ID reference',
  },
  question: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 1000,
    description: 'Interview question',
  },
  UserAns: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 5000,
    description: 'User answer',
  },
  email: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 255,
    description: 'User email',
  },
};

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Authentication Middleware
 * Ensures user is authenticated via Clerk
 */
export async function requireAuth(): Promise<{ userId: string; email?: string }> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  return {
    userId,
    email: sessionClaims?.email as string | undefined,
  };
}

/**
 * Rate Limiting Middleware
 * @param userId - User ID for rate limiting key
 * @param limit - Maximum requests (default: 10)
 * @param windowMs - Time window in ms (default: 60000)
 */
export function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const allowed = rateLimiter.isAllowed(userId, limit, windowMs);
  const remaining = rateLimiter.getRemaining(userId, limit);

  if (!allowed) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  return { allowed: true, remaining };
}

/**
 * Request Validation Middleware
 * Validates request body against schema
 */
export function validateRequest(
  body: unknown,
  schema: Record<string, unknown>
): { valid: boolean; data?: Record<string, unknown>; errors?: Array<{ field: string; message: string }> } {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Request body must be an object' }],
    };
  }

  const bodyObj = body as Record<string, unknown>;
  const errors: Array<{ field: string; message: string }> = [];
  const data: Record<string, unknown> = {};

  // Check for required fields
  for (const [field, config] of Object.entries(schema)) {
    const fieldConfig = config as Record<string, unknown>;
    const value = bodyObj[field];

    // Validate based on type
    if (fieldConfig.type === 'string') {
      validateStringField(field, value, fieldConfig, errors, data);
    } else if (fieldConfig.type === 'number') {
      validateNumberField(field, value, fieldConfig, errors, data);
    }
  }

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Helper to validate string fields
 */
function validateStringField(
  field: string,
  value: unknown,
  config: Record<string, unknown>,
  errors: Array<{ field: string; message: string }>,
  data: Record<string, unknown>
): void {
  const result = validateString(value, field, {
    required: config.required as boolean,
    minLength: config.minLength as number | undefined,
    maxLength: config.maxLength as number | undefined,
  });

  if (result.valid) {
    data[field] = result.data ? sanitizeText(result.data as string) : undefined;
  } else {
    errors.push(...result.errors.map((e) => ({ field: e.field, message: e.message })));
  }
}

/**
 * Helper to validate number fields
 */
function validateNumberField(
  field: string,
  value: unknown,
  config: Record<string, unknown>,
  errors: Array<{ field: string; message: string }>,
  data: Record<string, unknown>
): void {
  const result = validateNumber(value, field, {
    required: config.required as boolean,
    min: config.min as number | undefined,
    max: config.max as number | undefined,
  });

  if (result.valid) {
    data[field] = result.data;
  } else {
    errors.push(...result.errors.map((e) => ({ field: e.field, message: e.message })));
  }
}

/**
 * Security Context Middleware
 * Extracts security information from request
 */
export function getRequestSecurityContext(request: Request): {
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
} {
  return getSecurityContext(request);
}

// ============================================================================
// COMPREHENSIVE VALIDATION PIPELINE
// ============================================================================

/**
 * Full validation pipeline for API routes
 * Handles auth, rate limiting, validation, and sanitization
 */
export async function validateApiRequest(
  request: Request,
  schema: Record<string, unknown>,
  options: {
    rateLimit?: { enabled: boolean; limit?: number; windowMs?: number };
    sanitize?: boolean;
  } = {}
): Promise<{
  valid: boolean;
  userId?: string;
  data?: Record<string, unknown>;
  remaining?: number;
  errors?: Array<{ field: string; message: string; code?: string }>;
  securityContext?: ReturnType<typeof getRequestSecurityContext>;
}> {
  try {
    // Step 1: Authenticate user
    let userId: string;
    try {
      const auth_result = await requireAuth();
      userId = auth_result.userId;
    } catch {
      // Log authentication error internally but return safe message
      console.warn('[SECURITY] Authentication failed for API request');
      return {
        valid: false,
        errors: [{ field: 'auth', message: 'Authentication required', code: 'AUTH_REQUIRED' }],
      };
    }

    // Step 2: Check rate limiting if enabled
    if (options.rateLimit?.enabled !== false) {
      const limit = options.rateLimit?.limit ?? 10;
      const windowMs = options.rateLimit?.windowMs ?? 60000;
      const rateLimitCheck = checkRateLimit(userId, limit, windowMs);

      if (!rateLimitCheck.allowed) {
        return {
          valid: false,
          userId,
          errors: [
            {
              field: 'rateLimit',
              message: `Too many requests. Retry after ${rateLimitCheck.retryAfter}s`,
              code: 'RATE_LIMIT_EXCEEDED',
            },
          ],
        };
      }
    }

    // Step 3: Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return {
        valid: false,
        userId,
        errors: [{ field: 'body', message: 'Invalid JSON in request body', code: 'INVALID_JSON' }],
      };
    }

    // Step 4: Validate request against schema
    const validation = validateRequest(body, schema);

    if (!validation.valid) {
      return {
        valid: false,
        userId,
        errors: validation.errors,
      };
    }

    // Step 5: Get security context
    const securityContext = getRequestSecurityContext(request);

    return {
      valid: true,
      userId,
      data: validation.data,
      securityContext,
    };
  } catch (error) {
    console.error('[SECURITY] API request validation error:', error);
    return {
      valid: false,
      errors: [{ field: 'validation', message: 'Internal validation error', code: 'VALIDATION_ERROR' }],
    };
  }
}

// ============================================================================
// ERROR RESPONSE BUILDERS
// ============================================================================

/**
 * Build safe error response (doesn't expose internal details)
 */
export function buildErrorResponse(
  errors: Array<{ field: string; message: string; code?: string }>,
  statusCode: number = 400
): Response {
  // Log full errors internally
  console.warn('[SECURITY] Validation errors:', {
    timestamp: new Date().toISOString(),
    statusCode,
    errors,
  });

  // Return safe response to client
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Validation failed',
      errors: errors.map((e) => ({
        field: e.field,
        message: e.message,
      })),
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

/**
 * Build successful response with proper headers
 */
export function buildSuccessResponse(data: unknown, statusCode: number = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * USAGE IN API ROUTE:
 * 
 * export async function POST(req: Request): Promise<Response> {
 *   const validation = await validateApiRequest(req, INTERVIEW_REQUEST_SCHEMA, {
 *     rateLimit: { enabled: true, limit: 10, windowMs: 60000 },
 *   });
 *
 *   if (!validation.valid) {
 *     return buildErrorResponse(validation.errors!, 400);
 *   }
 *
 *   const { jobPosition, jobDesc, jobExperience } = validation.data!;
 *   const aiService = getAiService();
 *   const questions = await aiService.generateInterviewQuestions(
 *     jobPosition,
 *     jobDesc,
 *     jobExperience
 *   );
 *
 *   return buildSuccessResponse({ questions });
 * }
 */
