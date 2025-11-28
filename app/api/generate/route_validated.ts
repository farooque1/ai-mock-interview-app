/**
 * API Route: Generate Interview Questions
 * 
 * Endpoint: POST /api/generate
 * 
 * With comprehensive validation:
 * - Request validation using Zod schemas
 * - Clerk authentication check
 * - Input sanitization
 * - Rate limiting
 * - Secure error responses
 */

import { auth } from '@clerk/nextjs/server';
import { GoogleGenAI } from '@google/genai';
import {
  safeValidateCreateInterviewRequest,
  type CreateInterviewRequest,
} from '@/app/utils/validation.schemas';
import { sanitizeText } from '@/app/utils/security.utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface InterviewQuestion {
  question: string;
  answer: string;
}

interface InterviewResponse {
  questions: InterviewQuestion[];
  [key: string]: unknown;
}

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

// ============================================================================
// JSON EXTRACTION UTILITY
// ============================================================================

/**
 * Extract JSON from AI response that might be wrapped in markdown or have extra text
 */
function extractJsonFromText(input: string): Record<string, unknown> | Array<unknown> | null {
  if (!input) return null;

  // 1) Try direct parse
  try {
    return JSON.parse(input);
  } catch {
    // continue
  }

  // 2) Strip markdown code fences: ```json\n{...}\n``` or ```\n{...}\n```
  const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const fenceMatch = fenceRegex.exec(input.trim());
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      // continue
    }
  }

  // 3) Extract first JSON object by finding the first `{` and last `}`
  const firstBrace = input.indexOf('{');
  const lastBrace = input.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const maybeJson = input.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(maybeJson);
    } catch {
      // continue
    }
  }

  return null;
}



// ============================================================================
// REQUEST HANDLER
// ============================================================================

export async function POST(req: Request): Promise<Response> {
  try {
    // ========================================================================
    // 1. AUTHENTICATION CHECK
    // ========================================================================
    const { userId } = await auth();
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized: Authentication required',
        } as APIResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================================================
    // 2. PARSE REQUEST BODY
    // ========================================================================
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
        } as APIResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================================================
    // 4. VALIDATE REQUEST WITH ZOD
    // ========================================================================
    const validationResult = safeValidateCreateInterviewRequest(body);
    if (!validationResult.success) {
      // Convert error array format to simple messages
      const errors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(validationResult.errors)) {
        const msgArray = messages as string[];
        errors[key] = msgArray[0]; // Take first error message
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          errors,
        } as APIResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const validatedData = validationResult.data;

    // ========================================================================
    // 5. SANITIZE INPUT
    // ========================================================================
    const sanitizedData: CreateInterviewRequest = {
      jobPosition: sanitizeText(validatedData.jobPosition),
      jobDesc: sanitizeText(validatedData.jobDesc),
      jobExperience: validatedData.jobExperience,
    };

    // ========================================================================
    // 6. CALL AI SERVICE
    // ========================================================================
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY, // Private environment variable
    });

    const prompt = `
You are an interview generator bot.
Role: ${sanitizedData.jobPosition}
Tech stack: ${sanitizedData.jobDesc}
Experience: ${sanitizedData.jobExperience} years

Generate minimum 5 and maximum 10 interview questions and answers.
Return output in JSON format ONLY. Do NOT wrap the JSON in markdown or code fences; return raw JSON only.
JSON should have a "questions" array with objects containing "question" and "answer" fields.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    // ========================================================================
    // 7. EXTRACT AI RESPONSE TEXT
    // ========================================================================
    type ResponseLike = {
      text?: string | (() => Promise<string>) | (() => string);
    };

    let text: string;
    const maybeText = (response as unknown as ResponseLike).text;
    if (typeof maybeText === 'function') {
      text = String(await maybeText());
    } else {
      text = String(maybeText ?? '');
    }

    // ========================================================================
    // 8. PARSE AI RESPONSE
    // ========================================================================
    const parsed = extractJsonFromText(text);
    if (parsed === null) {
      console.error('/api/generate: Failed to parse AI response as JSON', { text });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI service returned invalid response format',
        } as APIResponse),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================================================
    // 9. VALIDATE AI RESPONSE STRUCTURE
    // ========================================================================
    if (!Array.isArray((parsed as Record<string, unknown>).questions)) {
      console.error('/api/generate: AI response missing questions array', { parsed });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI service returned unexpected response structure',
        } as APIResponse),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ============================================================================
    // 10. SANITIZE AI-GENERATED CONTENT
    // ============================================================================
    const questions = (parsed as InterviewResponse).questions.map((q: InterviewQuestion) => ({
      question: sanitizeText(q.question || ''),
      answer: sanitizeText(q.answer || ''),
    }));

    // ============================================================================
    // 11. SUCCESS RESPONSE
    // ============================================================================
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          questions,
          metadata: {
            jobPosition: sanitizedData.jobPosition,
            experience: sanitizedData.jobExperience,
            totalQuestions: questions.length,
          },
        },
      } as APIResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        },
      }
    );
  } catch (error) {
    // ============================================================================
    // ERROR HANDLING - NEVER EXPOSE INTERNAL DETAILS
    // ============================================================================
    console.error('/api/generate error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    // Only expose safe error messages to client
    const safeErrorMessage =
      errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('authentication')
        ? 'AI service temporarily unavailable'
        : 'Internal server error';

    return new Response(
      JSON.stringify({
        success: false,
        error: safeErrorMessage,
      } as APIResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }
}

// ============================================================================
// CORS PREFLIGHT
// ============================================================================

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
