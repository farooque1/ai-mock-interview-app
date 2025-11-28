/**
 * Interview-related type definitions
 * Centralized types to eliminate 'unknown' and ensure strict typing
 */

// ============================================
// Interview Question Types
// ============================================

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface InterviewQuestionsResponse {
  questions: InterviewQuestion[];
  role?: string;
  experience?: number;
}

// Alternative response format from AI
export interface AlternativeQuestionsResponse {
  interviewQuestions: InterviewQuestion[];
}

export type AiQuestionsResponse = InterviewQuestionsResponse | AlternativeQuestionsResponse;

// ============================================
// Feedback Types
// ============================================

export interface FeedbackResponse {
  rating: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// ============================================
// Interview Creation Types
// ============================================

export interface CreateInterviewRequest {
  jobPosition: string;
  jobDesc: string;
  jobExperience: number | string;
}

export interface InterviewData {
  mockId: string;
  jsonMockResp: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt: string;
}

// ============================================
// Recording & Answer Types
// ============================================

export interface UserAnswerData {
  mockIdRef: string;
  question: string;
  UserAns: string;
  correctanswer: string;
  score: string;
  feedback: string;
  userEmail: string;
  createdBy: string;
  createdAt: string;
  isSkipped: string;
}

export interface RecordAnswerProps {
  mockInterviewQuestions: InterviewQuestion[];
  currentQuestionIndex: number;
  interviewData: InterviewData;
  onQuestionCompleted?: (index: number) => void;
  onQuestionSkipped?: (index: number) => void;
}

// ============================================
// API Response Types
// ============================================

export interface ApiSuccessResponse<T> {
  data: T;
  status: "success";
}

export interface ApiErrorResponse {
  error: string;
  status: "error";
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Speech Recognition Types
// ============================================

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface SpeechRecognitionAPI {
  continuous: boolean;
  interimResults: boolean;
  language: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

// ============================================
// Feedback State Types
// ============================================

export interface FeedbackState {
  rating: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface RecordingState {
  userAnswer: string;
  isRecording: boolean;
  isEditing: boolean;
  feedback: FeedbackState | null;
  isFeedbackLoading: boolean;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null | undefined;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
