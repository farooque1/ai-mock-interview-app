/**
 * API Route: /api/generate
 * Generates interview questions using AI
 * 
 * Security Features:
 * ✅ Clerk authentication required
 * ✅ Input validation & sanitization
 * ✅ Rate limiting (10 requests/min)
 * ✅ Safe error responses (no internal details)
 * ✅ Uses private GEMINI_API_KEY
 * ✅ Security headers applied
 * 
 * Request: POST /api/generate
 * Body: { jobPosition: string, jobDesc: string, jobExperience: number }
 * Response: { success: true, data: { questions: InterviewQuestion[] } }
 */

import {
  validateApiRequest,
  INTERVIEW_REQUEST_SCHEMA,
  buildErrorResponse,
  buildSuccessResponse,
} from '@/app/utils/validation.middleware';
import { getAiService } from '@/app/utils/ai.service';
import { applySecurityHeaders } from '@/app/utils/security.utils';

export async function POST(req: Request): Promise<Response> {
  try {
    // Step 1: Full validation pipeline (auth + rate limit + schema validation)
    const validation = await validateApiRequest(req, INTERVIEW_REQUEST_SCHEMA, {
      rateLimit: { enabled: true, limit: 10, windowMs: 60000 },
    });

    if (!validation.valid) {
      let statusCode = 400;
      if (validation.errors?.some((e) => e.code === 'AUTH_REQUIRED')) {
        statusCode = 401;
      } else if (validation.errors?.some((e) => e.code === 'RATE_LIMIT_EXCEEDED')) {
        statusCode = 429;
      }
      return applySecurityHeaders(buildErrorResponse(validation.errors || [], statusCode));
    }

    // Step 2: Extract validated & sanitized data
    const { jobPosition, jobDesc, jobExperience } = validation.data as Record<string, unknown>;

    // Step 3: Generate questions via AI service
    const aiService = getAiService();
    const questions = await aiService.generateInterviewQuestions(
      jobPosition as string,
      jobDesc as string,
      jobExperience as number
    );

    // Step 4: Return safe response with security headers
    let response = buildSuccessResponse({
      questions,
      role: jobPosition,
      experience: jobExperience,
    });

    response = applySecurityHeaders(response);
    return response;
  } catch (error) {
    // Log internal error (never expose to client)
    console.error('[SECURITY] /api/generate error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });

    // Return safe generic error
    let response = buildErrorResponse(
      [{ field: 'server', message: 'Unable to generate questions. Please try again.' }],
      500
    );

    response = applySecurityHeaders(response);
    return response;
  }
}

/**
 * OPTIONS endpoint for CORS/CSRF preflight
 */
export async function OPTIONS(): Promise<Response> {
  const response = new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });

  return applySecurityHeaders(response);
}
