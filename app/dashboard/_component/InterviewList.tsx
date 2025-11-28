"use client";
import { db } from "@/app/utils/db";
import { MockInterview } from "@/app/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewListCard from "./InterviewListCard";

function InterviewList() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState<any[]>([]);

  const GetInterviewList = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress || ""))
      .orderBy(desc(MockInterview.id));

    setInterviews(result);
  };

  useEffect(() => {
    if (user) GetInterviewList();
  }, [user]);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h2 className="font-bold text-3xl mb-6 text-gray-900">
        Previous Mock Interviews
      </h2>

      {interviews.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-20">
          No interview history found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <InterviewListCard
              key={interview.mockId}
              interview={interview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewList;
