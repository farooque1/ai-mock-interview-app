/**
 * Custom hook for managing AI feedback
 * Handles fetching feedback from AI with error handling
 */

import { useState } from "react";
import { FeedbackState } from "@/app/types/interview.types";
import { logError } from "@/app/utils/api.utils";

interface UseFeedbackReturn {
  feedback: FeedbackState | null;
  isLoading: boolean;
  error: string | null;
  getFeedback: (prompt: string) => Promise<void>;
  reset: () => void;
}

export function useFeedback(): UseFeedbackReturn {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFeedback = async (prompt: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate input
      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        throw new Error("Invalid prompt provided");
      }

      // Call feedback API
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? `API error: ${response.status}`);
      }

      const feedbackData = await response.json();

      // Validate response structure
      if (!feedbackData.rating || !feedbackData.feedback) {
        throw new Error("Invalid feedback response structure");
      }

      setFeedback({
        rating: feedbackData.rating,
        feedback: feedbackData.feedback,
        strengths: Array.isArray(feedbackData.strengths) ? feedbackData.strengths : [],
        improvements: Array.isArray(feedbackData.improvements) ? feedbackData.improvements : [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logError("useFeedback.getFeedback", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = (): void => {
    setFeedback(null);
    setError(null);
  };

  return { feedback, isLoading, error, getFeedback, reset };
}
