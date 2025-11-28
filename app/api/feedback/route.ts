import { GoogleGenAI } from "@google/genai";

interface FeedbackResponse {
  rating: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body ?? {};

    if (!prompt) {
      return new Response(
        JSON.stringify({
          error: "Missing required field: prompt",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });

    const enhancedPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON in this exact format, with NO additional text, markdown, or code fences:
{
  "rating": <number between 1-10>,
  "feedback": "<brief 3-5 line feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: enhancedPrompt,
    });

    // Handle different SDK response types
    type ResponseLike = {
      text?: string | (() => Promise<string>) | (() => string);
    };
    let text: string;
    const maybeText = (response as unknown as ResponseLike).text;
    if (typeof maybeText === "function") {
      text = String(await maybeText());
    } else {
      text = String(maybeText ?? "");
    }

    // Parse JSON with fallback strategies
    const extractJsonFromText = (
      input: string
    ): Record<string, unknown> | null => {
      if (!input) return null;

      // 1) Try direct parse
      try {
        return JSON.parse(input);
      } catch {
        // continue
      }

      // 2) Strip markdown code fences
      const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
      const fenceMatch = fenceRegex.exec(input.trim());
      if (fenceMatch?.[1]) {
        try {
          return JSON.parse(fenceMatch[1]);
        } catch {
          // continue
        }
      }

      // 3) Extract first JSON object
      const firstBrace = input.indexOf("{");
      const lastBrace = input.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const maybeJson = input.slice(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(maybeJson);
        } catch {
          // continue
        }
      }

      return null;
    };

    const parsed = extractJsonFromText(text);
    if (!parsed) {
      return new Response(
        JSON.stringify({
          error: "Failed to parse feedback response as JSON",
          raw: text,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate response structure
    const feedback = parsed as unknown as FeedbackResponse;
    if (!feedback.rating || !feedback.feedback) {
      return new Response(
        JSON.stringify({
          error: "Invalid feedback response structure",
          received: feedback,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ensure rating is between 1-10
    const normalizedRating = Math.min(
      Math.max(Number(feedback.rating) || 5, 1),
      10
    );

    const response_data: FeedbackResponse = {
      rating: normalizedRating,
      feedback: String(feedback.feedback),
      strengths: Array.isArray(feedback.strengths)
        ? (feedback.strengths as string[])
        : [],
      improvements: Array.isArray(feedback.improvements)
        ? (feedback.improvements as string[])
        : [],
    };

    return new Response(JSON.stringify(response_data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("/api/feedback error:", error);
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error as { message?: unknown }).message
        : undefined;
    return new Response(
      JSON.stringify({ error: String(errorMessage ?? error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
