/**
 * Zod Validation Schemas
 * 
 * Comprehensive input validation with:
 * - Strict type checking
 * - Length limits
 * - Pattern validation
 * - Error messages
 * - Type-safe outputs
 */

import { z } from 'zod';

// ============================================================================
// CONSTANTS
// ============================================================================

export const VALIDATION_LIMITS = {
  // Text field limits
  JOB_POSITION_MIN: 2,
  JOB_POSITION_MAX: 100,
  JOB_DESC_MIN: 10,
  JOB_DESC_MAX: 2000,
  USER_ANSWER_MIN: 5,
  USER_ANSWER_MAX: 5000,
  FEEDBACK_PROMPT_MIN: 10,
  FEEDBACK_PROMPT_MAX: 5000,
  EMAIL_MAX: 255,
  
  // Numeric limits
  EXPERIENCE_MIN: 0,
  EXPERIENCE_MAX: 80,
  RATING_MIN: 1,
  RATING_MAX: 10,
  
  // Array limits
  INTERVIEW_QUESTIONS_MIN: 5,
  INTERVIEW_QUESTIONS_MAX: 10,
  STRENGTHS_MIN: 0,
  STRENGTHS_MAX: 5,
  IMPROVEMENTS_MIN: 0,
  IMPROVEMENTS_MAX: 5,
} as const;

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Job Position Schema - Validates job role
 */
export const jobPositionSchema = z
  .string('Job position must be a string')
  .trim()
  .min(VALIDATION_LIMITS.JOB_POSITION_MIN, 
    `Job position must be at least ${VALIDATION_LIMITS.JOB_POSITION_MIN} characters`)
  .max(VALIDATION_LIMITS.JOB_POSITION_MAX, 
    `Job position must not exceed ${VALIDATION_LIMITS.JOB_POSITION_MAX} characters`)
  .regex(/^[a-zA-Z\s\-./,&()]+$/, 
    'Job position can only contain letters, spaces, and common punctuation');

/**
 * Job Description Schema - Validates tech stack/requirements
 */
export const jobDescSchema = z
  .string('Job description must be a string')
  .trim()
  .min(VALIDATION_LIMITS.JOB_DESC_MIN, 
    `Job description must be at least ${VALIDATION_LIMITS.JOB_DESC_MIN} characters`)
  .max(VALIDATION_LIMITS.JOB_DESC_MAX, 
    `Job description must not exceed ${VALIDATION_LIMITS.JOB_DESC_MAX} characters`)
  .regex(/^[a-zA-Z0-9\s\-,.():/\\+*#@]+$/, 
    'Job description contains invalid characters');

/**
 * Experience Schema - Validates years of experience
 */
export const experienceSchema = z
  .number('Experience must be a number')
  .int('Experience must be a whole number')
  .min(VALIDATION_LIMITS.EXPERIENCE_MIN, 
    `Experience must be at least ${VALIDATION_LIMITS.EXPERIENCE_MIN}`)
  .max(VALIDATION_LIMITS.EXPERIENCE_MAX, 
    `Experience must not exceed ${VALIDATION_LIMITS.EXPERIENCE_MAX}`);

/**
 * User Answer Schema - Validates user's answer to interview question
 */
export const userAnswerSchema = z
  .string('Answer must be a string')
  .trim()
  .min(VALIDATION_LIMITS.USER_ANSWER_MIN, 
    `Answer must be at least ${VALIDATION_LIMITS.USER_ANSWER_MIN} characters`)
  .max(VALIDATION_LIMITS.USER_ANSWER_MAX, 
    `Answer must not exceed ${VALIDATION_LIMITS.USER_ANSWER_MAX} characters`);

/**
 * Feedback Prompt Schema - Validates prompt for AI feedback
 */
export const feedbackPromptSchema = z
  .string('Feedback prompt must be a string')
  .trim()
  .min(VALIDATION_LIMITS.FEEDBACK_PROMPT_MIN, 
    `Prompt must be at least ${VALIDATION_LIMITS.FEEDBACK_PROMPT_MIN} characters`)
  .max(VALIDATION_LIMITS.FEEDBACK_PROMPT_MAX, 
    `Prompt must not exceed ${VALIDATION_LIMITS.FEEDBACK_PROMPT_MAX} characters`);

/**
 * Mock Interview ID Schema - Validates interview reference ID
 */
export const mockIdRefSchema = z
  .string('Interview ID must be a string')
  .min(1, 'Interview ID is required')
  .max(100, 'Invalid interview ID');

/**
 * Email Schema - Validates email address
 */
export const emailSchema = z
  .string('Email must be a string')
  .email('Invalid email address')
  .max(VALIDATION_LIMITS.EMAIL_MAX, 'Email too long');

/**
 * Question Schema - Validates a single question object
 */
export const questionSchema = z.object({
  question: z
    .string('Question must be a string')
    .min(5, 'Question too short')
    .max(1000, 'Question too long'),
  answer: z
    .string('Answer must be a string')
    .min(5, 'Answer too short')
    .max(2000, 'Answer too long'),
});

/**
 * Rating Schema - Validates feedback rating
 */
export const ratingSchema = z
  .number('Rating must be a number')
  .int('Rating must be a whole number')
  .min(VALIDATION_LIMITS.RATING_MIN, `Rating must be at least ${VALIDATION_LIMITS.RATING_MIN}`)
  .max(VALIDATION_LIMITS.RATING_MAX, `Rating must not exceed ${VALIDATION_LIMITS.RATING_MAX}`);

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

/**
 * Create Interview Request Schema
 * Used when generating new interview questions
 */
export const createInterviewRequestSchema = z.object({
  jobPosition: jobPositionSchema,
  jobDesc: jobDescSchema,
  jobExperience: experienceSchema,
});

export type CreateInterviewRequest = z.infer<typeof createInterviewRequestSchema>;

/**
 * Generate Feedback Request Schema
 * Used when requesting AI feedback on an answer
 */
export const generateFeedbackRequestSchema = z.object({
  mockIdRef: mockIdRefSchema,
  userAnswer: userAnswerSchema,
});

export type GenerateFeedbackRequest = z.infer<typeof generateFeedbackRequestSchema>;

/**
 * Save Answer Request Schema
 * Used when saving user answer to database
 */
export const saveAnswerRequestSchema = z.object({
  mockIdRef: mockIdRefSchema,
  question: z
    .string('Question must be a string')
    .min(5, 'Question too short')
    .max(1000, 'Question too long'),
  UserAns: userAnswerSchema,
  email: emailSchema,
});

export type SaveAnswerRequest = z.infer<typeof saveAnswerRequestSchema>;

/**
 * Update Interview Request Schema
 * Used when updating interview details
 */
export const updateInterviewRequestSchema = z.object({
  mockIdRef: mockIdRefSchema,
  jobPosition: jobPositionSchema.optional(),
  jobDesc: jobDescSchema.optional(),
  jobExperience: experienceSchema.optional(),
});

export type UpdateInterviewRequest = z.infer<typeof updateInterviewRequestSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Interview Question Response Schema
 * Validates structure of generated questions
 */
export const interviewQuestionResponseSchema = z.object({
  question: z.string('Question must be a string'),
  answer: z.string('Answer must be a string'),
});

export type InterviewQuestionResponse = z.infer<typeof interviewQuestionResponseSchema>;

/**
 * Create Interview Response Schema
 * Validates response when creating interview
 */
export const createInterviewResponseSchema = z.object({
  questions: z
    .array(interviewQuestionResponseSchema, 'Questions must be an array')
    .min(VALIDATION_LIMITS.INTERVIEW_QUESTIONS_MIN, 
      `Must generate at least ${VALIDATION_LIMITS.INTERVIEW_QUESTIONS_MIN} questions`)
    .max(VALIDATION_LIMITS.INTERVIEW_QUESTIONS_MAX, 
      `Must generate no more than ${VALIDATION_LIMITS.INTERVIEW_QUESTIONS_MAX} questions'),
  role: jobPositionSchema,
  experience: experienceSchema,
});

export type CreateInterviewResponse = z.infer<typeof createInterviewResponseSchema>;

/**
 * Feedback Response Schema
 * Validates structure of AI feedback
 */
export const feedbackResponseSchema = z.object({
  rating: ratingSchema,
  feedback: z.string('Feedback must be a string').min(10, 'Feedback too short').max(2000, 'Feedback too long'),
  strengths: z
    .array(z.string('Strength must be a string'))
    .min(VALIDATION_LIMITS.STRENGTHS_MIN, 'At least one strength required')
    .max(VALIDATION_LIMITS.STRENGTHS_MAX, 'Too many strengths listed')
    .optional()
    .default([]),
  improvements: z
    .array(z.string('Improvement must be a string'))
    .min(VALIDATION_LIMITS.IMPROVEMENTS_MIN, 'At least one improvement required')
    .max(VALIDATION_LIMITS.IMPROVEMENTS_MAX, 'Too many improvements listed')
    .optional()
    .default([]),
});

export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates and parses create interview request
 * @throws ZodError if validation fails
 */
export function validateCreateInterviewRequest(data: unknown): CreateInterviewRequest {
  return createInterviewRequestSchema.parse(data);
}

/**
 * Safely validates create interview request (returns result, not exception)
 */
export function safeValidateCreateInterviewRequest(
  data: unknown
): { success: true; data: CreateInterviewRequest } | { success: false; errors: Record<string, string[]> } {
  const result = createInterviewRequestSchema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}

/**
 * Validates and parses generate feedback request
 */
export function validateGenerateFeedbackRequest(data: unknown): GenerateFeedbackRequest {
  return generateFeedbackRequestSchema.parse(data);
}

/**
 * Safely validates generate feedback request
 */
export function safeValidateGenerateFeedbackRequest(
  data: unknown
): { success: true; data: GenerateFeedbackRequest } | { success: false; errors: Record<string, string[]> } {
  const result = generateFeedbackRequestSchema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}

/**
 * Validates and parses save answer request
 */
export function validateSaveAnswerRequest(data: unknown): SaveAnswerRequest {
  return saveAnswerRequestSchema.parse(data);
}

/**
 * Safely validates save answer request
 */
export function safeValidateSaveAnswerRequest(
  data: unknown
): { success: true; data: SaveAnswerRequest } | { success: false; errors: Record<string, string[]> } {
  const result = saveAnswerRequestSchema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}

/**
 * Validates interview question response
 */
export function validateInterviewQuestionResponse(data: unknown): InterviewQuestionResponse {
  return interviewQuestionResponseSchema.parse(data);
}

/**
 * Validates create interview response
 */
export function validateCreateInterviewResponse(data: unknown): CreateInterviewResponse {
  return createInterviewResponseSchema.parse(data);
}

/**
 * Validates feedback response
 */
export function validateFeedbackResponse(data: unknown): FeedbackResponse {
  return feedbackResponseSchema.parse(data);
}

// ============================================================================
// FORM-FRIENDLY VALIDATION
// ============================================================================

/**
 * Validates a single field and returns error message or null
 * Perfect for real-time client-side validation
 */
export function validateField(
  fieldName: keyof CreateInterviewRequest,
  value: unknown
): string | null {
  try {
    const schema = 
      fieldName === 'jobPosition' ? jobPositionSchema :
      fieldName === 'jobDesc' ? jobDescSchema :
      fieldName === 'jobExperience' ? experienceSchema :
      null;

    if (!schema) return 'Unknown field';
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Validation failed';
    }
    return 'Validation failed';
  }
}

/**
 * Get all validation errors for a field
 */
export function getFieldErrors(
  fieldName: string,
  value: unknown,
  schema: z.ZodSchema
): string[] {
  try {
    schema.parse(value);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.map((issue) => issue.message);
    }
    return ['Validation failed'];
  }
}

/**
 * Validates entire form and returns errors by field
 */
export function validateForm(
  formData: Record<string, unknown>,
  schema: z.ZodSchema
): Record<string, string> {
  const result = schema.safeParse(formData);
  const errors: Record<string, string> = {};

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });
  }

  return errors;
}

/**
 * Type guard for CreateInterviewRequest
 */
export function isCreateInterviewRequest(data: unknown): data is CreateInterviewRequest {
  return createInterviewRequestSchema.safeParse(data).success;
}

/**
 * Type guard for GenerateFeedbackRequest
 */
export function isGenerateFeedbackRequest(data: unknown): data is GenerateFeedbackRequest {
  return generateFeedbackRequestSchema.safeParse(data).success;
}

/**
 * Type guard for SaveAnswerRequest
 */
export function isSaveAnswerRequest(data: unknown): data is SaveAnswerRequest {
  return saveAnswerRequestSchema.safeParse(data).success;
}
