/**
 * Database Service Layer - Centralized database operations
 * Provides typed, error-handled database operations
 * Simplified wrapper around db operations for consistency and error handling
 */

import { db } from "./db";
import { MockInterview, UserAnswer } from "./schema";
import { InterviewData, UserAnswerData } from "@/app/types/interview.types";
import { logError } from "./api.utils";

// ============================================
// Interview Operations
// ============================================

/**
 * Creates a new interview record in the database
 */
export async function createInterview(
  data: Omit<InterviewData, "id">
): Promise<InterviewData> {
  try {
    const result = await db
      .insert(MockInterview)
      .values({
        mockId: data.mockId,
        jsonMockResp: data.jsonMockResp,
        jobPosition: data.jobPosition,
        jobDesc: data.jobDesc,
        jobExperience: data.jobExperience,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
      })
      .returning({ mockId: MockInterview.mockId });

    if (!result[0]?.mockId) {
      throw new Error("Failed to create interview - no mockId returned");
    }

    return data;
  } catch (error) {
    logError("createInterview", error);
    throw new Error(`Failed to create interview: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================
// User Answer Operations
// ============================================

/**
 * Saves a user's answer to a question
 */
export async function saveUserAnswer(data: UserAnswerData): Promise<void> {
  try {
    // Validate required fields
    if (!data.mockIdRef || !data.question || !data.userEmail) {
      throw new Error("Missing required fields: mockIdRef, question, userEmail");
    }

    await db.insert(UserAnswer).values({
      mockIdRef: data.mockIdRef,
      question: data.question,
      UserAns: data.UserAns,
      correctanswer: data.correctanswer,
      score: data.score,
      feedback: data.feedback,
      userEmail: data.userEmail,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      isSkipped: data.isSkipped,
    });
  } catch (error) {
    logError("saveUserAnswer", error);
    throw new Error(`Failed to save user answer: ${error instanceof Error ? error.message : String(error)}`);
  }
}
