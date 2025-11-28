"use client";

import { db } from "@/app/utils/db";
import { MockInterview } from "@/app/utils/schema";
import { eq } from "drizzle-orm";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import Question from "./_component/Question";
import Recordanwser from "./_component/Recordanwser";
import InterviewHeader from "./_component/InterviewHeader";

interface InterviewQuestion {
  question: string;
  answer: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface InterviewData {
  mockId: string;
  jsonMockResp: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt?: string;
}

function StartInterview() {
  const params = useParams<{ interviewId: string }>();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(true);

  const getInterviewDetails = useCallback(async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));

      if (result && result.length > 0) {
        const jsonQuestions = JSON.parse(result[0].jsonMockResp || "[]");
        const formattedQuestions = Array.isArray(jsonQuestions)
          ? jsonQuestions
          : jsonQuestions.interviewQuestions || [];

        setMockInterviewQuestions(formattedQuestions);
        setInterviewData(result[0] as InterviewData);
      } else {
        console.warn("No interview data found for this ID:", params.interviewId);
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
    } finally {
      setLoading(false);
    }
  }, [params.interviewId]);

  useEffect(() => {
    getInterviewDetails();
  }, [getInterviewDetails]);

  const handleQuestionCompleted = (index: number) => {
    if (!completedQuestions.includes(index)) {
      setCompletedQuestions([...completedQuestions, index]);
    }
    setSkippedQuestions(skippedQuestions.filter((q) => q !== index));
  };

  const handleQuestionSkipped = (index: number) => {
    if (!skippedQuestions.includes(index)) {
      setSkippedQuestions([...skippedQuestions, index]);
    }
    setCompletedQuestions(completedQuestions.filter((q) => q !== index));
  };

  const handleTimeUp = () => {
    setIsInterviewActive(false);
    console.log("⏰ Interview time is up!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading interview details...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <InterviewHeader
        totalQuestions={mockInterviewQuestions.length}
        completedQuestions={completedQuestions.length}
        skippedQuestions={skippedQuestions.length}
        currentQuestionIndex={currentQuestionIndex}
        isInterviewActive={isInterviewActive}
        onTimeUp={handleTimeUp}
      />

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="flex-1 p-5 overflow-y-auto bg-white shadow-inner">
          <Question
            mockInterviewQuestions={mockInterviewQuestions}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center items-center border-l md:border-t-0 border-gray-200 bg-gray-50 p-5 overflow-y-auto">
          <Recordanwser
            mockInterviewQuestions={mockInterviewQuestions}
            currentQuestionIndex={currentQuestionIndex}
            interviewData={interviewData}
            onQuestionCompleted={handleQuestionCompleted}
            onQuestionSkipped={handleQuestionSkipped}
          />
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
