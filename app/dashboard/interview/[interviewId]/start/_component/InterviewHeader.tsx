"use client";

import React, { useEffect, useState } from "react";
import { Clock, CheckCircle, SkipForward } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface InterviewHeaderProps {
  totalQuestions: number;
  completedQuestions: number;
  skippedQuestions: number;
  currentQuestionIndex: number;
  isInterviewActive: boolean;
  onTimeUp?: () => void;
}

function InterviewHeader({
  totalQuestions,
  completedQuestions,
  skippedQuestions,
  currentQuestionIndex,
  isInterviewActive,
  onTimeUp,
}: InterviewHeaderProps) {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    if (!isInterviewActive || isTimeUp) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterviewActive, isTimeUp, onTimeUp]);

  // Convert seconds to MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercentage =
    totalQuestions > 0 ? ((completedQuestions + skippedQuestions) / totalQuestions) * 100 : 0;

  // Determine timer background color based on time left
  const getTimerBgClass = () => {
    if (isTimeUp) return "bg-red-100 border-2 border-red-500";
    if (timeLeft <= 60) return "bg-red-100 border-2 border-red-500";
    if (timeLeft <= 300) return "bg-orange-100 border-2 border-orange-500";
    return "bg-blue-100 border-2 border-blue-500";
  };

  // Determine timer text color based on time left
  const getTimerColor = () => {
    if (timeLeft <= 60) return "text-red-600"; // Critical: < 1 minute
    if (timeLeft <= 300) return "text-orange-600"; // Warning: < 5 minutes
    return "text-green-600"; // Safe
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 shadow-md p-4">
      {/* Top Row: Timer & Stats */}
      <div className="flex items-center justify-between mb-4">
        {/* Left: Question Counter */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              Question Progress
            </p>
            <p className="text-lg font-bold text-gray-800">
              {currentQuestionIndex + 1} / {totalQuestions}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-700">{completedQuestions}</span>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
              <SkipForward className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-700">{skippedQuestions}</span>
              <span className="text-gray-600">Skipped</span>
            </div>
          </div>
        </div>

        {/* Right: Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getTimerBgClass()}`}>
          <Clock className={`w-5 h-5 ${getTimerColor()}`} />
          <div className="flex flex-col">
            <p className="text-xs text-gray-600 font-medium uppercase">Time Left</p>
            <p className={`text-xl font-bold ${getTimerColor()}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
          {isTimeUp && <span className="ml-2 text-xs font-semibold text-red-600">TIME UP!</span>}
        </div>
      </div>

      {/* Bottom Row: Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Overall Progress
          </p>
          <p className="text-sm font-bold text-blue-600">
            {Math.round(progressPercentage)}%
          </p>
        </div>
        <Progress value={progressPercentage} className="h-3 rounded-full" />
      </div>

      {/* Warning Message when time is running out */}
      {timeLeft <= 60 && !isTimeUp && (
        <div className="mt-3 p-2 bg-red-100 border border-red-400 rounded-md flex items-center gap-2">
          <span className="text-red-600 font-semibold text-sm">⚠️ Less than 1 minute left!</span>
        </div>
      )}

      {isTimeUp && (
        <div className="mt-3 p-2 bg-red-200 border border-red-600 rounded-md flex items-center gap-2">
          <span className="text-red-700 font-bold text-sm">🛑 Interview Time is Up! Submit your answers.</span>
        </div>
      )}
    </div>
  );
}

export default InterviewHeader;
