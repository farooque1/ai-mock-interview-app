import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobPosition, jobDesc, jobExperience } = body ?? {};

    if (
      !jobPosition ||
      !jobDesc ||
      jobExperience === undefined ||
      jobExperience === null
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: jobPosition, jobDesc, jobExperience",
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

    const prompt = `
You are an interview generator bot.
Role: ${jobPosition}
Tech stack: ${jobDesc}
Experience: ${jobExperience} years

Generate minimum 5 and maximum 10 interview questions and answers.
Return output in JSON format ONLY. Do NOT wrap the JSON in markdown or code fences; return raw JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // `response.text` may be a function or a value depending on the SDK version.
    type ResponseLike = {
      text?: string | (() => Promise<string>) | (() => string);
    };
    let text: string;
    const maybeText = (response as unknown as ResponseLike).text;
    if (typeof maybeText === "function") {
      // function that returns the text
      text = String(await maybeText());
    } else {
      text = String(maybeText ?? "");
    }

    // Try a few strategies to extract JSON in case the model wrapped the JSON
    // in markdown fences or returned extra text around it.
    const extractJsonFromText = (
      input: string
    ): Record<string, unknown> | Array<unknown> | null => {
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
    if (parsed === null) {
      // Return raw text as part of error so client can debug
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response as JSON",
          raw: text,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // keep error unknown-safe
    console.error("/api/generate error:", error);
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
