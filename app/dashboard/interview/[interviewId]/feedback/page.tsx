"use client";
import { db } from "@/app/utils/db";
import { UserAnswer } from "@/app/utils/schema";
import { eq } from "drizzle-orm";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

function Feedback() {
  const params = useParams<{ interviewId: string }>();
  const [feedbackData, setFeedbackData] = React.useState<any[]>([]);
  const router = useRouter();

  const GetFeedback = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params?.interviewId))
      .orderBy(UserAnswer.id);

    setFeedbackData(result);
  };

  // Calculate dynamic rating
  const totalScore = feedbackData.reduce((acc, item) => {
    return acc + Number(item.score);
  }, 0);

  const dynamicRating =
    feedbackData.length > 0 ? (totalScore / feedbackData.length).toFixed(1) : 0;

  const passFail = Number(dynamicRating) >= 5 ? "Pass" : "Fail";

  useEffect(() => {
    GetFeedback();
  }, []);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      {/* If No Data */}
      {feedbackData.length === 0 ? (
        <h2 className="text-center text-gray-500 text-lg">
          No Interview Feedback Found
        </h2>
      ) : (
        <>
          {/* Header Card */}
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-3xl font-bold text-green-700 flex items-center gap-3">
              <Award size={35} /> Congratulations!
            </h2>
            <p className="text-lg mt-2 text-green-800">
              You have successfully completed your mock interview.
            </p>
          </div>

          {/* Rating Box */}
          <div className="mt-6 p-5 bg-white shadow-md rounded-xl border">
            <h2 className="font-bold text-2xl mb-2">
              Interview Feedback Summary
            </h2>

            <div className="flex items-center gap-3">
              <Star className="text-yellow-500 fill-yellow-300" size={30} />

              {/* Rating + pass fail section wrapper */}
              <div className="flex flex-col">
                {/* Overall Rating */}
                <p className="text-lg font-semibold text-gray-800">
                  Overall Rating :
                  <span className="font-bold text-primary ml-2">
                    {dynamicRating}/10
                  </span>
                </p>

                {/* Pass/Fail Box */}
                <div className="mt-2 p-2 rounded-lg border bg-white shadow-sm w-fit">
                  <p className="text-sm font-bold">
                    Result:
                    <span
                      className={`ml-2 ${
                        passFail === "Pass" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {passFail}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full mt-3">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: "70%" }}
              ></div>
            </div>
          </div>

          <h2 className="text-sm font-semibold mt-6 text-gray-700">
            Below are your questions, your answers, and the correct solutions:
          </h2>

          {/* MAP FEEDBACK */}
          {feedbackData.map((item, index) => (
            <div key={index} className="mt-6">
              <Collapsible>
                <CollapsibleTrigger className="w-full p-4 bg-gray-100 hover:bg-gray-200 transition border rounded-lg flex justify-between font-medium">
                  {item?.question}
                  <ChevronsUpDown className="opacity-70" />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="flex flex-col gap-4 p-5 bg-white border border-gray-200 rounded-lg shadow-sm mt-2">
                    <h2 className="text-sm p-2 border rounded-lg bg-yellow-50 text-yellow-900">
                      <strong>Rating:</strong> {item?.score}
                    </h2>

                    <h2 className="p-3 border rounded-lg bg-red-50 text-sm text-red-900">
                      <strong>Your Answer:</strong> {item?.UserAns}
                    </h2>

                    <h2 className="p-3 border rounded-lg bg-green-50 text-sm text-green-900">
                      <strong>Correct Answer:</strong> {item?.correctanswer}
                    </h2>

                    <h2 className="p-3 border rounded-lg bg-blue-50 text-sm text-blue-900">
                      <strong>Feedback:</strong> {item?.feedback}
                    </h2>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </>
      )}

      {/* Back Button */}
      <Button className="mt-6" onClick={() => router.push("/dashboard")}>
        Back To Home
      </Button>
    </div>
  );
}

export default Feedback;
