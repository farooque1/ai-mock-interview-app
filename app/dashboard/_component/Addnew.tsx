"use client";
import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/app/utils/db";
import { MockInterview } from "@/app/utils/schema";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type AIQuestion = { question: string; answer: string };
type AIResult = { role?: string; experience?: string | number; questions?: AIQuestion[]; interviewQuestions?: AIQuestion[] };
type AIError = { error?: string; raw?: unknown };

type AIResponse = AIResult | AIError | null;

function Addnew() {
  const [isOpen, setIsOpen] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResponse>(null);
  const [loading, setLoading] = useState(false);
  const {user}=useUser();
  const router=useRouter()


  const bearerToken = (typeof globalThis !== "undefined" && globalThis.localStorage?.getItem("api_bearer")) ?? process.env.NEXT_PUBLIC_API_BEARER ?? "";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (bearerToken) {
        headers["Authorization"] = `Bearer ${bearerToken}`;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ jobPosition, jobDesc, jobExperience }),
      });

      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setAiResponse(data);
        console.log("res",res);
        if (data) {
          const mockId = crypto.randomUUID();
          const resp = await db.insert(MockInterview).values({
            mockId: mockId,
            jsonMockResp: JSON.stringify(data),
            jobPosition: jobPosition,
            jobDesc: jobDesc,
            jobExperience: String(jobExperience),
            createdBy: user?.primaryEmailAddress?.emailAddress || "unknown",
            createdAt: new Date().toISOString(),
          }).returning({ mockId: MockInterview.mockId });
          console.log("resp DB", resp);
          router.push(`/dashboard/interview/${resp[0]?.mockId}`);
        }
      } else {
        console.error("API error:", data);
        setAiResponse({ error: data.error ?? "Unknown error", raw: data.raw });
        alert(`Error: ${data.error ?? res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      setAiResponse({ error: String(err) });
      alert("Error generating questions. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setIsOpen(true)}
      >
        <h2 className="font-bold text-lg text-center">+ Add new Interview</h2>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tell me more about your job?</DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div className="mt-7 my-3">
                  <div className="my-3">
                    <label htmlFor="jobPosition">Job Position</label>
                    <Input
                      id="jobPosition"
                      type="text"
                      placeholder="Software Engineer"
                      value={jobPosition}
                      onChange={(e) => setJobPosition(e.target.value)}
                      required
                    />
                  </div>
                  <div className="my-3">
                    <label htmlFor="jobDesc">Tech Stack</label>
                    <Textarea
                      id="jobDesc"
                      placeholder="React, Next.js, Node, PostgreSQL"
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      required
                    />
                  </div>
                  <div className="my-3">
                    <label htmlFor="jobExperience">Experience</label>
                    <Input
                      id="jobExperience"
                      type="number"
                      placeholder="E.g 5"
                      value={jobExperience}
                      onChange={(e) => setJobExperience(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-5 justify-end">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "AI Generating..." : "Start"}
                  </Button>
                </div>
              </form>

              {/* {aiResponse && (
                <div className="mt-4">
                  {('error' in aiResponse) && (
                    <div className="mb-3 p-3 bg-red-100 text-red-800 rounded">{aiResponse.error}</div>
                  )}
                  {(() => {
                    const resp = aiResponse as AIResult & { interviewQuestions?: AIQuestion[] };
                    let qs: AIQuestion[] | undefined;
                    if (Array.isArray(resp.questions)) {
                      qs = resp.questions;
                    } else if (Array.isArray(resp.interviewQuestions)) {
                      qs = resp.interviewQuestions;
                    }

                    if (!qs) return <div className="text-sm text-muted-foreground">No questions returned.</div>;

                    return (
                      <div className="grid gap-3 mt-2 h-50">
                        {qs.map((q, i) => {
                          const key = (q.question || `${i}`).slice(0, 60) + '-' + String(i);
                          return (
                            <div key={key} className="p-4 bg-white border rounded shadow-sm">
                              <div className="font-medium">Q{i + 1}. {q.question}</div>
                              <div className="mt-2 text-sm text-muted-foreground">{q.answer}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )} */}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Addnew;
