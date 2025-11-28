"use client";

import { db } from "@/app/utils/db";
import { MockInterview } from "@/app/utils/schema";
import { Button } from "@/components/ui/button";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";

function Interview() {
  const params = useParams<{ interviewId: string }>();
  const [InterviewDetails, setInterviewDetails] = useState<any>([]);
  const [EnableWebcam, setEnableWebcam] = useState(false);

  const GetinterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
    setInterviewDetails(result[0]);
  };

  useEffect(() => {
    GetinterviewDetails();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center my-12 px-4">
      {/* Header */}
      <h2 className="font-extrabold text-3xl mb-2 text-gray-800 text-center">
        Let’s Get Started
      </h2>
      <p className="text-gray-500 text-center mb-10">
        Prepare yourself for an AI-powered interactive mock interview
        experience.
      </p>

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
        {/* Left Section - Job Info */}
        <div className="flex flex-col gap-6">
          {/* Job Details */}
          <div className="flex flex-col p-6 gap-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition">
            <h2 className="text-lg text-gray-700">
              Job Description / Tech Stack:{" "}
              <strong className="text-gray-900">
                {InterviewDetails?.jobDesc}
              </strong>
            </h2>
            <h2 className="text-lg text-gray-700">
              Role / Position:{" "}
              <strong className="text-gray-900">
                {InterviewDetails?.jobPosition}
              </strong>
            </h2>
            <h2 className="text-lg text-gray-700">
              Experience Required:{" "}
              <strong className="text-gray-900">
                {InterviewDetails?.jobExperience}
              </strong>
            </h2>
          </div>

          {/* Information Card */}
          <div className="flex flex-col p-5 gap-3 rounded-xl border border-yellow-300 bg-yellow-50 shadow-sm">
            <h2 className="flex gap-2 items-center text-yellow-600 font-semibold">
              <Lightbulb className="h-5 w-5" />
              Important Information
            </h2>
            <p className="text-yellow-700 leading-relaxed">
              Please enable your <strong>webcam</strong> and{" "}
              <strong>microphone</strong> to begin your mock interview. You’ll
              be asked around <strong>5–10 role-based questions</strong> related
              to your selected tech stack.
              <br />
              Your responses help assess <strong>communication</strong> and{" "}
              <strong>technical skills</strong>.
              <br />
              <br />
              🔒 All data is processed locally —{" "}
              <strong>no audio or video is stored</strong>.
            </p>
          </div>
        </div>

        {/* Right Section - Webcam + Start Button */}
        <div className="flex flex-col items-center justify-center gap-5 p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition relative">
          {EnableWebcam ? (
            <>
              <Webcam
                onUserMedia={() => setEnableWebcam(true)}
                onUserMediaError={() => setEnableWebcam(false)}
                mirrored={true}
                className="rounded-lg border-2 border-gray-300 shadow-md"
                // style={{ height: 400, width: 400 }}
              />

              {/* Start Interview Button */}
              <Link href={`/dashboard/interview/${params.interviewId}/start`}>
                <Button className="mt-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Interview
                </Button>
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interview;
