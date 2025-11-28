import React from "react";
import { Briefcase, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function InterviewListCard({ interview }: any) {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-4">
        <h2 className="font-semibold text-lg">{interview.jobDesc}</h2>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Experience */}
        <div className="flex items-center gap-2 text-gray-700">
          <Briefcase size={18} className="text-blue-500" />
          <span className="text-sm font-medium">
            {interview.jobExperience} Years of Experience
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-gray-700">
          <CalendarDays size={18} className="text-green-600" />
          <span className="text-sm">
            {new Date(interview.createdAt).toLocaleString()}
          </span>
        </div>

        {/* {Button} */}
        <div className="flex justify-between gap-2  ">
          <Link href={`/dashboard/interview/${interview.mockId}/feedback`}>
          <Button size="sm" variant={"outline"} className=""
          >Feedback</Button>
          </Link>
          <Link href={`/dashboard/interview/${interview.mockId}/start`}>
          <Button size="sm" className="">Start</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default InterviewListCard;
