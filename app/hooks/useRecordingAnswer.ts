/**
 * Custom hook for managing interview answer recording and saving
 * Handles speech recognition, editing, and database persistence
 */

import { useState } from "react";
import { UserAnswerData, RecordingState, FeedbackState } from "@/app/types/interview.types";
import { saveUserAnswer } from "@/app/utils/database.service";
import { logError } from "@/app/utils/api.utils";
import { toast } from "sonner";

interface UseRecordingAnswerReturn {
  state: RecordingState;
  appendToAnswer: (text: string) => void;
  setUserAnswer: (answer: string) => void;
  setIsEditing: (editing: boolean) => void;
  setFeedback: (feedback: FeedbackState | null) => void;
  setIsFeedbackLoading: (loading: boolean) => void;
  resetAnswer: () => void;
  saveAnswerToDatabase: (data: UserAnswerData) => Promise<void>;
}

export function useRecordingAnswer(): UseRecordingAnswerReturn {
  const [state, setState] = useState<RecordingState>({
    userAnswer: "",
    isRecording: false,
    isEditing: false,
    feedback: null,
    isFeedbackLoading: false,
  });

  const appendToAnswer = (text: string): void => {
    setState((prev) => ({
      ...prev,
      userAnswer: (prev.userAnswer + " " + text).trim(),
    }));
  };

  const setUserAnswer = (answer: string): void => {
    setState((prev) => ({
      ...prev,
      userAnswer: answer,
    }));
  };

  const setIsEditing = (editing: boolean): void => {
    setState((prev) => ({
      ...prev,
      isEditing: editing,
    }));
  };

  const setFeedback = (feedback: typeof state.feedback | null): void => {
    setState((prev) => ({
      ...prev,
      feedback,
    }));
  };

  const setIsFeedbackLoading = (loading: boolean): void => {
    setState((prev) => ({
      ...prev,
      isFeedbackLoading: loading,
    }));
  };

  const resetAnswer = (): void => {
    setState((prev) => ({
      ...prev,
      userAnswer: "",
      isEditing: false,
      feedback: null,
      isFeedbackLoading: false,
    }));
  };

  const saveAnswerToDatabase = async (data: UserAnswerData): Promise<void> => {
    try {
      // Validate required fields
      if (!data.mockIdRef || !data.question || !data.userEmail) {
        throw new Error("Missing required fields for saving answer");
      }

      await saveUserAnswer(data);
      toast.success("Answer saved successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logError("useRecordingAnswer.saveAnswerToDatabase", err);
      toast.error(`Failed to save answer: ${errorMessage}`);
      throw err;
    }
  };

  return {
    state,
    appendToAnswer,
    setUserAnswer,
    setIsEditing,
    setFeedback,
    setIsFeedbackLoading,
    resetAnswer,
    saveAnswerToDatabase,
  };
}
