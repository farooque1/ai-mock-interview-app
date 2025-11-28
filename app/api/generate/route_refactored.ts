/**
 * API Route: /api/generate
 * Generates interview questions using AI
 * 
 * Request: POST /api/generate
 * Body: { jobPosition: string, jobDesc: string, jobExperience: number }
 * Response: { questions: InterviewQuestion[] }
 */

import { parseJsonBody, errorResponse, successResponse, validateInterviewRequest, logError } from "@/app/utils/api.utils";
import { getAiService } from "@/app/utils/ai.service";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request): Promise<Response> {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse and validate request
    const body = await parseJsonBody(req);
    const validation = validateInterviewRequest(body);

    if (!validation.valid) {
      const errorMessages = validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
      return errorResponse(`Validation error: ${errorMessages}`, 400, validation.errors);
    }

    const { jobPosition, jobDesc, jobExperience } = validation.data;

    // Generate questions using AI service
    const aiService = getAiService();
    const questions = await aiService.generateInterviewQuestions(
      jobPosition,
      jobDesc,
      Number(jobExperience)
    );

    // Return success response
    return successResponse({
      questions,
      role: jobPosition,
      experience: jobExperience,
    });
  } catch (error) {
    logError("/api/generate", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return errorResponse("AI service configuration error", 500);
    }

    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
