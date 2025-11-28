/**
 * API utilities for error handling, validation, and responses
 */

import { ApiErrorResponse, ApiSuccessResponse, CreateInterviewRequest } from "@/app/types/interview.types";

// ============================================
// Validation Constants
// ============================================

const VALIDATION_RULES = {
  jobPosition: {
    minLength: 2,
    maxLength: 255,
    required: true,
  },
  jobDesc: {
    minLength: 10,
    maxLength: 2000,
    required: true,
  },
  jobExperience: {
    min: 0,
    max: 100,
    required: true,
  },
  prompt: {
    minLength: 10,
    maxLength: 5000,
    required: true,
  },
};

// ============================================
// Error Response Builder
// ============================================

export function createErrorResponse(
  error: string,
  details?: unknown
): ApiErrorResponse {
  return {
    status: "error",
    error,
    details,
  };
}

export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    status: "success",
    data,
  };
}

// ============================================
// HTTP Response Builders
// ============================================

export function jsonResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(
  message: string,
  status: number = 400,
  details?: unknown
): Response {
  return jsonResponse(createErrorResponse(message, details), status);
}

export function successResponse<T>(data: T, status: number = 200): Response {
  return jsonResponse(createSuccessResponse(data), status);
}

// ============================================
// Input Validation
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export function validateInterviewRequest(
  data: unknown
): { valid: true; data: CreateInterviewRequest } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return {
      valid: false,
      errors: [{ field: "body", message: "Request body must be a valid object" }],
    };
  }

  const req = data as Record<string, unknown>;

  // Validate jobPosition
  if (!req.jobPosition || typeof req.jobPosition !== "string") {
    errors.push({ field: "jobPosition", message: "jobPosition is required and must be a string" });
  } else if (
    req.jobPosition.length < VALIDATION_RULES.jobPosition.minLength ||
    req.jobPosition.length > VALIDATION_RULES.jobPosition.maxLength
  ) {
    errors.push({
      field: "jobPosition",
      message: `jobPosition must be between ${VALIDATION_RULES.jobPosition.minLength} and ${VALIDATION_RULES.jobPosition.maxLength} characters`,
    });
  }

  // Validate jobDesc
  if (!req.jobDesc || typeof req.jobDesc !== "string") {
    errors.push({ field: "jobDesc", message: "jobDesc is required and must be a string" });
  } else if (
    req.jobDesc.length < VALIDATION_RULES.jobDesc.minLength ||
    req.jobDesc.length > VALIDATION_RULES.jobDesc.maxLength
  ) {
    errors.push({
      field: "jobDesc",
      message: `jobDesc must be between ${VALIDATION_RULES.jobDesc.minLength} and ${VALIDATION_RULES.jobDesc.maxLength} characters`,
    });
  }

  // Validate jobExperience
  const exp = Number(req.jobExperience);
  if (!Number.isInteger(exp) || req.jobExperience === undefined || req.jobExperience === null) {
    errors.push({ field: "jobExperience", message: "jobExperience is required and must be a number" });
  } else if (exp < VALIDATION_RULES.jobExperience.min || exp > VALIDATION_RULES.jobExperience.max) {
    errors.push({
      field: "jobExperience",
      message: `jobExperience must be between ${VALIDATION_RULES.jobExperience.min} and ${VALIDATION_RULES.jobExperience.max}`,
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      jobPosition: req.jobPosition as string,
      jobDesc: req.jobDesc as string,
      jobExperience: exp,
    },
  };
}

export function validateFeedbackRequest(
  data: unknown
): { valid: true; data: { prompt: string } } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return {
      valid: false,
      errors: [{ field: "body", message: "Request body must be a valid object" }],
    };
  }

  const req = data as Record<string, unknown>;

  if (!req.prompt || typeof req.prompt !== "string") {
    errors.push({ field: "prompt", message: "prompt is required and must be a string" });
  } else if (
    req.prompt.length < VALIDATION_RULES.prompt.minLength ||
    req.prompt.length > VALIDATION_RULES.prompt.maxLength
  ) {
    errors.push({
      field: "prompt",
      message: `prompt must be between ${VALIDATION_RULES.prompt.minLength} and ${VALIDATION_RULES.prompt.maxLength} characters`,
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      prompt: req.prompt as string,
    },
  };
}

// ============================================
// Request Parsing
// ============================================

export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new Error("Invalid JSON in request body");
  }
}

// ============================================
// Error Logging
// ============================================

export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context}] Error:`, message);
  if (stack) {
    console.error(`[${context}] Stack:`, stack);
  }
}
