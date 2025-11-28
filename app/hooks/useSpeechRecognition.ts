/**
 * Custom hook for managing Web Speech API
 * Provides speech recognition with proper cleanup and error handling
 */

import { useEffect, useRef, useState } from "react";
import { SpeechRecognitionAPI } from "@/app/types/interview.types";
import { logError } from "@/app/utils/api.utils";

interface UseSpeechRecognitionReturn {
  isRecording: boolean;
  transcript: string;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Initialize Speech Recognition on mount
  useEffect(() => {
    if (typeof globalThis === "undefined") {
      return;
    }

    try {
      // Check browser support
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition: any =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).SpeechRecognition ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        setError("Speech Recognition not supported in this browser");
        return;
      }

      const recognition = new SpeechRecognition() as SpeechRecognitionAPI;
      recognitionRef.current = recognition;
      setIsSupported(true);

      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.language = "en-US";

      // Event handlers
      recognition.onstart = (): void => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event: Event): void => {
        try {
          const speechEvent = event as unknown as {
            resultIndex: number;
            results: SpeechRecognitionResultList;
          };
          let finalTranscript = "";

          for (let i = speechEvent.resultIndex; i < speechEvent.results.length; i++) {
            const transcript = speechEvent.results[i][0].transcript;
            if (speechEvent.results[i].isFinal) {
              finalTranscript += transcript + " ";
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => (prev + finalTranscript).trim());
          }
        } catch (err) {
          logError("useSpeechRecognition.onresult", err);
        }
      };

      recognition.onerror = (event: Event): void => {
        const errorEvent = event as unknown as { error: string };
        const errorMessage = `Speech recognition error: ${errorEvent.error}`;
        logError("useSpeechRecognition.onerror", errorMessage);
        setError(errorMessage);
      };

      recognition.onend = (): void => {
        setIsRecording(false);
      };

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      };
    } catch (err) {
      logError("useSpeechRecognition.setup", err);
      setError("Failed to initialize speech recognition");
    }
  }, []);

  const startRecording = (): void => {
    if (recognitionRef.current && !isRecording) {
      setError(null);
      recognitionRef.current.start();
    }
  };

  const stopRecording = (): void => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = (): void => {
    setTranscript("");
    setError(null);
  };

  return {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
  };
}
