"use client";

import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Mic, WebcamIcon, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/app/utils/db";
import { UserAnswer } from "@/app/utils/schema";
import { useUser } from "@clerk/nextjs";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface RecordAnswerProps {
  readonly mockInterviewQuestions: unknown[];
  readonly currentQuestionIndex: number;
  readonly interviewData: unknown;
  readonly onQuestionCompleted?: (index: number) => void;
  readonly onQuestionSkipped?: (index: number) => void;
}

function RecordAnswer({
  mockInterviewQuestions,
  currentQuestionIndex,
  interviewData,
  onQuestionCompleted,
  onQuestionSkipped,
}: RecordAnswerProps) {
  const [enableWebcam, setEnableWebcam] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<{
    rating: number;
    feedback: string;
    strengths?: string[];
    improvements?: string[];
  } | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();

  console.log("answerTextareaRef", userAnswer);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof globalThis === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition: any =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = "en-US";

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsRecording(true);
    };

    recognition.onresult = (event: Event) => {
      const speechEvent = event as unknown as SpeechRecognitionEvent;
      let final = "";

      for (
        let i = speechEvent.resultIndex;
        i < speechEvent.results.length;
        i++
      ) {
        const transcript = speechEvent.results[i][0].transcript;

        if (speechEvent.results[i].isFinal) {
          final += transcript + " ";
        }
      }

      if (final) {
        setUserAnswer((prev) => (prev + final).trim());
      }
    };

    recognition.onerror = (event: Event) => {
      const errorEvent = event as unknown as SpeechRecognitionErrorEvent;
      console.error("Speech recognition error:", errorEvent.error);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsRecording(false);
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleResetAnswer = () => {
    setUserAnswer("");
    setIsEditing(false);
    setFeedback(null);
  };

  const handleSaveAnswerDB = () => {
    // Mark question as completed and move to next question
    onQuestionCompleted?.(currentQuestionIndex);
    setUserAnswer("");
    setIsEditing(false);
    setFeedback(null);
    toast.success("Answer saved! Ready for next question.");
  };

  const handleSkipQuestion = () => {
    // Mark question as skipped
    onQuestionSkipped?.(currentQuestionIndex);
    setUserAnswer("");
    setIsEditing(false);
    setFeedback(null);
    toast.info("Question skipped. Moving to next question.");
  };

  const handleSaveUserAnswer = async () => {
    if (isRecording) {
      handleStopRecording();

      setIsFeedbackLoading(true);
      try {
        const question = (
          mockInterviewQuestions[currentQuestionIndex] as { question: string }
        ).question;
        const correctanswer = (
          mockInterviewQuestions[currentQuestionIndex] as { answer: string }
        ).answer;
        const feedbackprompt =
          "Question: " +
          question +
          "\nAnswer: " +
          userAnswer +
          "\nProvide feedback on the answer to help improve it and provide the rating of the answer between 1 to 10 in just 3-5 lines to improve the answer.";

        const result = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: feedbackprompt }),
        });
        console.log(question);
        console.log(result);
        if (!result.ok) {
          throw new Error(`API error: ${result.status}`);
        }

        const feedbackData = await result.json();
        console.log("Feedback Response:", feedbackData);

        if (feedbackData.error) {
          toast.error("Failed to get feedback: " + feedbackData.error);
          return;
        }

        setFeedback({
          rating: feedbackData.rating || 5,
          feedback: feedbackData.feedback || "No feedback available",
          strengths: feedbackData.strengths || [],
          improvements: feedbackData.improvements || [],
        });

        toast.success("Feedback received! Review your answer below.");

        // Extract mockId safely from interviewData
        const mockIdRef = (interviewData as { mockId?: string })?.mockId;
        if (!mockIdRef) {
          toast.error("Interview ID not found. Cannot save answer.");
          return;
        }

        if (!user?.primaryEmailAddress?.emailAddress) {
          toast.error("User email not found. Cannot save answer.");
          return;
        }

        try {
          const valuesToInsert = {
            mockIdRef: mockIdRef,
            question: question,
            UserAns: userAnswer,
            correctanswer: correctanswer,
            score: String(feedbackData.rating || 5),
            feedback: feedbackData.feedback || "",
            userEmail: user.primaryEmailAddress.emailAddress,
            createdAt: new Date().toISOString(),
            createdBy: user.primaryEmailAddress.emailAddress,
            isSkipped: "false",
          };

          console.log(
            "📦 Data being inserted into UserAnswer table:",
            valuesToInsert
          );

          const resp = await db.insert(UserAnswer).values(valuesToInsert);

          console.log("✅ Insert response:", resp);
          toast.success("Answer and feedback saved successfully!");
        } catch (dbError) {
          console.error("❌ Database error:", dbError);
          toast.error("Failed to save answer to database. Please try again.");
          throw dbError;
        }
      } catch (error) {
        console.error("Feedback error:", error);
        toast.error("Failed to get feedback. Please try again.");
      } finally {
        setIsFeedbackLoading(false);
      }
    } else {
      handleStartRecording();
    }
  };

  const handleEditAnswer = () => {
    setIsEditing(true);
    if (answerTextareaRef.current) {
      answerTextareaRef.current.focus();
    }
  };

  const handleSaveAnswer = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h3 className="text-xl font-semibold mb-1 text-gray-700">
        Live Interview Feed
      </h3>

      <div className="border-4 rounded-xl shadow-md p-2 flex flex-col items-center justify-center w-full">
        {enableWebcam ? (
          <>
            <div className="relative w-[500px] h-[300px] flex items-center justify-center border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-black">
              <Webcam
                onUserMedia={() => setEnableWebcam(true)}
                onUserMediaError={() => setEnableWebcam(false)}
                mirrored
                className="absolute top-0 left-0 w-full h-full object-cover"
                videoConstraints={{
                  width: 400,
                  height: 300,
                  facingMode: "user",
                }}
              />
            </div>

            {/* Record Button */}
            <Button
              onClick={handleSaveUserAnswer}
              className={`mt-4 flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium transition ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isRecording ? (
                <>
                  <StopCircle className="w-5 h-5" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" /> Record Answer
                </>
              )}
            </Button>

            <p className="text-gray-500 mt-3 text-sm">
              🎙️ {isRecording ? "Listening..." : "Not Recording"}
            </p>

            {userAnswer && (
              <div className="mt-4 bg-white border-2 border-blue-300 rounded-lg p-4 w-full text-left shadow-md flex flex-col h-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Your Answer:
                </h3>

                {isEditing ? (
                  <>
                    <textarea
                      ref={answerTextareaRef}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
                      placeholder="Edit your answer here..."
                      style={{ minHeight: "100px" }}
                    />
                    <div className="flex gap-2 mt-1">
                      <Button
                        onClick={handleSaveAnswer}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs rounded font-medium"
                      >
                        ✓ Save Answer
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 text-xs rounded font-medium"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-md border border-gray-200 mb-2">
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {userAnswer}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleEditAnswer}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs rounded font-medium"
                      >
                        ✎ Edit Answer
                      </Button>
                      <Button
                        onClick={handleResetAnswer}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs rounded font-medium"
                      >
                        × Clear Answer
                      </Button>
                      <Button
                        onClick={handleSkipQuestion}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 text-xs rounded font-medium"
                      >
                        ⏭ Skip
                      </Button>
                      <Button
                        onClick={handleSaveAnswerDB}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs rounded font-medium"
                      >
                        ✓ Save Answer
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Feedback Section */}
            {isFeedbackLoading && (
              <div className="mt-4 bg-blue-50 border-2 border-blue-400 rounded-lg p-4 w-full text-center shadow-md">
                <p className="text-blue-700 font-medium">
                  ⏳ Getting AI feedback... Please wait
                </p>
              </div>
            )}

            {feedback && !isFeedbackLoading && <></>}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-6 rounded-full bg-gray-100 border">
              <WebcamIcon className="h-20 w-20 text-gray-500" />
            </div>
            <Button
              onClick={() => setEnableWebcam(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
            >
              Enable Webcam & Microphone
            </Button>
            <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
              We recommend a well-lit environment for best video quality.
            </p>
          </div>
        )}
      </div>

      <p className="text-gray-500 mt-4 text-sm text-center">
        Make sure your webcam and microphone are working properly.
      </p>
    </div>
  );
}

export default RecordAnswer;
