import React from "react";
import Addnew from "./_component/Addnew";
import InterviewList from "./_component/InterviewList";

function Dashboard() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Create and start your AI-based mock interviews
        </p>

        {/* Hero Card */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-md border">
          <h3 className="text-xl font-semibold text-gray-800">
            Welcome back! Ready to practice?
          </h3>
          <p className="text-gray-600 mt-1">
            Create a new mock interview or continue from your previous sessions.
          </p>

          {/* Add New Card Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-5">
            <Addnew />
          </div>
        </div>

        {/* Interview List Section */}
        <div className="mt-10">
          <InterviewList />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
