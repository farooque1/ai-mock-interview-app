/**
 * API Route: /api/feedback
 * Generates AI feedback on interview answers
 * 
 * Request: POST /api/feedback
 * Body: { prompt: string }
 * Response: { rating: number, feedback: string, strengths: string[], improvements: string[] }
 */

import { parseJsonBody, errorResponse, successResponse, validateFeedbackRequest, logError } from "@/app/utils/api.utils";
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
    const validation = validateFeedbackRequest(body);

    if (!validation.valid) {
      const errorMessages = validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
      return errorResponse(`Validation error: ${errorMessages}`, 400, validation.errors);
    }

    const { prompt } = validation.data;

    // Generate feedback using AI service
    const aiService = getAiService();
    const feedback = await aiService.generateFeedback(prompt);

    // Return success response
    return successResponse(feedback);
  } catch (error) {
    logError("/api/feedback", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return errorResponse("AI service configuration error", 500);
    }

    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
}
