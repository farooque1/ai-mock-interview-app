"use client";
import { Button } from "@/components/ui/button";
import { Code, MonitorCheck, Brain, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {

  const router=useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900 font-sans">

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
          AI Mock Interviews for  
          <span className="text-primary"> Developers</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Practice Frontend, Backend, Full Stack, and DevOps interviews with AI.
          Get instant feedback on your answers, improve your skills, and get job-ready.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" className="flex items-center gap-2" onClick={()=>router.push('/dashboard')}>
            Start Practice <ArrowRight size={18} />
          </Button>

          <Button size="lg" variant="outline" onClick={()=>router.push('/dashboard')}>
            Explore Features
          </Button>
        </div>

        {/* Icons Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* 1 — Frontend */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all">
            <MonitorCheck className="mx-auto text-primary" size={40} />
            <h3 className="mt-4 font-semibold text-xl">Frontend Developer</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              React, Next.js, JavaScript, CSS, TypeScript, System Design & more.
            </p>
          </div>

          {/* 2 — Backend */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all">
            <Code className="mx-auto text-primary" size={40} />
            <h3 className="mt-4 font-semibold text-xl">Backend Developer</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Node.js, Express, Databases, APIs, Authentication & more.
            </p>
          </div>

          {/* 3 — AI Feedback */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all">
            <Brain className="mx-auto text-primary" size={40} />
            <h3 className="mt-4 font-semibold text-xl">AI Feedback Engine</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Get instant scoring, corrections, and best answers for each question.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
