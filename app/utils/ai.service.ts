/**
 * AI Service Layer - Centralized Gemini AI operations
 * Handles all interactions with Google Gemini API
 * 
 * ⚠️ SECURITY: Uses private GEMINI_API_KEY (server-side only)
 */

import { GoogleGenAI } from "@google/genai";
import {
  InterviewQuestion,
  FeedbackResponse,
} from "@/app/types/interview.types";
import { logError } from "./api.utils";

// ============================================
// AI Service Configuration
// ============================================

class AiService {
  private readonly client: GoogleGenAI;
  private readonly model = "gemini-2.0-flash";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set or empty");
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  // ============================================
  // Interview Questions Generation
  // ============================================

  async generateInterviewQuestions(
    jobPosition: string,
    jobDesc: string,
    jobExperience: number
  ): Promise<InterviewQuestion[]> {
    try {
      const prompt = `
You are an interview generator bot.
Role: ${jobPosition}
Tech stack: ${jobDesc}
Experience: ${jobExperience} years

Generate minimum 5 and maximum 10 interview questions and answers.
Return output in JSON format ONLY. Do NOT wrap the JSON in markdown or code fences; return raw JSON only.
Expected format:
{
  "questions": [
    { "question": "...", "answer": "..." },
    ...
  ]
}
`;

      const response = await this.generateContent(prompt);
      const parsed = this.extractJson(response);

      // Handle both response formats
      let questions: InterviewQuestion[] | undefined;
      const parsedObj = parsed as Record<string, unknown>;
      if (
        "questions" in parsedObj &&
        Array.isArray(parsedObj.questions)
      ) {
        questions = parsedObj.questions as InterviewQuestion[];
      } else if (
        "interviewQuestions" in parsedObj &&
        Array.isArray(parsedObj.interviewQuestions)
      ) {
        questions = parsedObj.interviewQuestions as InterviewQuestion[];
      }

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error("No valid questions found in AI response");
      }

      return questions;
    } catch (error) {
      logError("generateInterviewQuestions", error);
      throw error;
    }
  }

  // ============================================
  // Feedback Generation
  // ============================================

  async generateFeedback(prompt: string): Promise<FeedbackResponse> {
    try {
      const enhancedPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON in this exact format, with NO additional text, markdown, or code fences:
{
  "rating": <number between 1-10>,
  "feedback": "<brief 3-5 line feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

      const response = await this.generateContent(enhancedPrompt);
      const parsed = this.extractJson(response);

      // Validate response structure
      const feedback = this.validateFeedbackStructure(parsed);
      return feedback;
    } catch (error) {
      logError("generateFeedback", error);
      throw error;
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      // Handle different SDK response types
      const maybeText = this.extractTextFromResponse(response);
      if (!maybeText) {
        throw new Error("No text content in AI response");
      }
      return maybeText;
    } catch (error) {
      logError("generateContent", error);
      throw error;
    }
  }

  private extractTextFromResponse(response: unknown): string | null {
    type ResponseLike = {
      text?: string | (() => Promise<string>) | (() => string);
    };

    const resp = response as ResponseLike;
    const maybeText = resp.text;

    if (typeof maybeText === "function") {
      // Return a promise - caller must handle async
      // For now, return null to indicate async response
      return null;
    }

    return String(maybeText ?? "");
  }

  private extractJson(text: string): Record<string, unknown> | Array<unknown> {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text format for JSON extraction");
    }

    // Strategy 1: Try direct parse
    try {
      return JSON.parse(text);
    } catch {
      // Continue to next strategy
    }

    // Strategy 2: Strip markdown code fences
    const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
    const fenceMatch = fenceRegex.exec(text.trim());
    if (fenceMatch?.[1]) {
      try {
        return JSON.parse(fenceMatch[1]);
      } catch {
        // Continue to next strategy
      }
    }

    // Strategy 3: Extract first JSON object
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const maybeJson = text.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(maybeJson);
      } catch {
        // Continue to next strategy
      }
    }

    // Strategy 4: Extract first JSON array
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const maybeJson = text.slice(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(maybeJson);
      } catch {
        // Continue
      }
    }

    throw new Error(`Failed to extract JSON from text: ${text.substring(0, 100)}...`);
  }

  private validateFeedbackStructure(data: Record<string, unknown> | Array<unknown>): FeedbackResponse {
    if (Array.isArray(data)) {
      throw new TypeError("Expected object, got array");
    }

    const feedback = data as Record<string, unknown>;

    if (typeof feedback.rating !== "number") {
      throw new TypeError("rating must be a number");
    }

    if (typeof feedback.feedback !== "string") {
      throw new TypeError("feedback must be a string");
    }

    // Validate rating range
    const rating = Math.min(Math.max(feedback.rating, 1), 10);

    return {
      rating,
      feedback: feedback.feedback,
      strengths: Array.isArray(feedback.strengths)
        ? (feedback.strengths as string[]).filter((s) => typeof s === "string")
        : [],
      improvements: Array.isArray(feedback.improvements)
        ? (feedback.improvements as string[]).filter((i) => typeof i === "string")
        : [],
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

let aiService: AiService | null = null;

export function getAiService(): AiService {
  if (!aiService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }
    aiService = new AiService(apiKey);
  }
  return aiService;
}

// For testing/mocking
export function setAiService(service: AiService): void {
  aiService = service;
}
