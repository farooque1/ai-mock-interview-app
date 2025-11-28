import React from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Volume, Volume1, Volume2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface QuestionProps {
  mockInterviewQuestions: any[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
}

function Question({
  mockInterviewQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  interviewData,
}: QuestionProps) {
  
  const currentQuestion = mockInterviewQuestions[currentQuestionIndex];
  const params = useParams<{ interviewId: string }>();
  console.log(params?.interviewId)

  if (!mockInterviewQuestions || mockInterviewQuestions.length === 0) {
    return (
      <p className="text-center text-gray-500 italic">
        No interview questions found.
      </p>
    );
  }

  const textToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Question Card */}
      <div className="border rounded-2xl bg-white shadow-md hover:shadow-lg transition p-6">
        <div className="text-center mb-5">
          <h3 className="text-lg font-semibold text-blue-700">
            Question {currentQuestionIndex + 1} 
            {/* of {mockInterviewQuestions.length} */}
          </h3>
          <div className="mt-2 h-[2px] w-20 bg-blue-600 mx-auto rounded"></div>
        </div>

        <p className="text-gray-800 text-base leading-relaxed text-center mb-6 px-3">
          {currentQuestion?.question}
        </p>
        <Volume2 className="cursor-pointer" onClick={() => textToSpeech(currentQuestion?.question || "")} />

        {/* Optional: show correct answer for demo or review mode */}
        {/* <div className="bg-green-50 border border-green-300 rounded-md p-3 text-sm text-green-700 mb-4">
          <strong>Answer:</strong> {currentQuestion?.answer}
        </div> */}

        <div className="flex justify-between mt-6">
          <Button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            variant="outline"
            className="px-6 py-2 font-medium rounded-md border-gray-300 hover:bg-gray-100"
          >
            ← Previous
          </Button>

          {currentQuestionIndex < mockInterviewQuestions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="px-6 py-2 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Next →
            </Button>
          ) : (
            <Link href={`/dashboard/interview/${params?.interviewId}/feedback`}>

            <Button className="px-6 py-2 font-medium bg-green-600 hover:bg-green-700 text-white rounded-md">
              Finish Interview
            </Button>
            </Link>
          )}
        </div>

      </div>

      {/* Info Card */}
      <div className="flex flex-col p-5 gap-3 rounded-xl border border-yellow-300 bg-yellow-50 shadow-sm">
        <h2 className="flex gap-2 items-center text-yellow-600 font-semibold">
          <Lightbulb className="h-5 w-5" />
          Interview Guidelines
        </h2>
        <p className="text-yellow-700 text-sm leading-relaxed">
          🎤 Please ensure your <strong>webcam</strong> and{" "}
          <strong>microphone</strong> are active before starting.
          <br />
          💬 You’ll answer around <strong>5–10 role-based questions</strong>{" "}
          related to your selected tech stack.
          <br />
          📊 Your responses will help assess{" "}
          <strong>communication</strong> and <strong>technical skills</strong>.
          <br />
          🔒 All recordings are processed locally —{" "}
          <strong>no data is stored or shared</strong>.
        </p>
      </div>
    </div>
  );
}

export default Question;
