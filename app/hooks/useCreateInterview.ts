/**
 * Custom hook for managing interview creation
 * Handles API calls, validation, and state management
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CreateInterviewRequest, InterviewQuestion } from "@/app/types/interview.types";
import { createInterview } from "@/app/utils/database.service";
import { toast } from "sonner";

interface CreateInterviewState {
  loading: boolean;
  error: string | null;
  questions: InterviewQuestion[] | null;
}

interface UseCreateInterviewReturn {
  state: CreateInterviewState;
  createNewInterview: (request: CreateInterviewRequest) => Promise<void>;
  reset: () => void;
}

export function useCreateInterview(): UseCreateInterviewReturn {
  const router = useRouter();
  const { user } = useUser();
  const [state, setState] = useState<CreateInterviewState>({
    loading: false,
    error: null,
    questions: null,
  });

  const createNewInterview = async (request: CreateInterviewRequest): Promise<void> => {
    setState({ loading: true, error: null, questions: null });

    try {
      // Validate user is authenticated
      if (!user?.primaryEmailAddress?.emailAddress) {
        throw new Error("User not authenticated");
      }

      // Call API to generate questions
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? `API error: ${response.status}`);
      }

      const generatedData = await response.json();

      // Extract questions based on response format
      let questions: InterviewQuestion[] = [];
      if (
        generatedData.questions &&
        Array.isArray(generatedData.questions) &&
        generatedData.questions.length > 0
      ) {
        questions = generatedData.questions;
      } else if (
        generatedData.interviewQuestions &&
        Array.isArray(generatedData.interviewQuestions) &&
        generatedData.interviewQuestions.length > 0
      ) {
        questions = generatedData.interviewQuestions;
      } else {
        throw new Error("No questions received from AI");
      }

      // Save to database
      const mockId = crypto.randomUUID();
      const interviewData = await createInterview({
        mockId,
        jsonMockResp: JSON.stringify(generatedData),
        jobPosition: request.jobPosition,
        jobDesc: request.jobDesc,
        jobExperience: String(request.jobExperience),
        createdBy: user.primaryEmailAddress.emailAddress,
        createdAt: new Date().toISOString(),
      });

      setState({ loading: false, error: null, questions });

      toast.success("Interview created successfully!");

      // Navigate to interview
      router.push(`/dashboard/interview/${interviewData.mockId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setState({ loading: false, error: errorMessage, questions: null });
      toast.error(errorMessage);
    }
  };

  const reset = (): void => {
    setState({ loading: false, error: null, questions: null });
  };

  return { state, createNewInterview, reset };
}
