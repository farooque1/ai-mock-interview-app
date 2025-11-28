import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const MockInterview = pgTable("mockInterview", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonMockResp").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  jobDesc: varchar("jobDesc").notNull(),
  jobExperience: varchar("jobExperience").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt"),
  mockId: varchar("mockId").notNull()
});


export const UserAnswer = pgTable("userAnswer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockIdRef").notNull(),
  question: text("question").notNull(),
  UserAns: text("UserAns"),
  correctanswer: text("correctanswer"),
  score: varchar("score"),
  feedback: text("feedback"),
  userEmail: varchar("userEmail"),
  createdBy: varchar("createdBy"),
  createdAt: varchar("createdAt"),
  isSkipped: varchar("isSkipped").default("false"), // Track if user skipped the question
});
