# 🚀 Quick Start Guide - Refactored Code

## 5-Minute Setup

### Step 1: Copy Files (1 minute)

Copy these new files to your project:

```bash
# Types
cp app/types/interview.types.ts (new file)

# Hooks
cp app/hooks/useCreateInterview.ts (new file)
cp app/hooks/useSpeechRecognition.ts (new file)
cp app/hooks/useFeedback.ts (new file)
cp app/hooks/useRecordingAnswer.ts (new file)

# Services & Utils
cp app/utils/ai.service.ts (new file)
cp app/utils/database.service.ts (new file)
cp app/utils/api.utils.ts (new file)
cp app/utils/string.utils.ts (new file)

# API Routes
cp app/api/generate/route_refactored.ts → app/api/generate/route.ts
cp app/api/feedback/route_refactored.ts → app/api/feedback/route.ts
```

### Step 2: Update Environment (1 minute)

Edit `.env.local`:

```bash
# REMOVE these lines:
# NEXT_PUBLIC_DATABASE_URL=...
# NEXT_PUBLIC_GEMINI_API_KEY=...

# ADD these lines:
DATABASE_URL=postgresql://neondb_owner:npg_wbjXv2nHhtM7@ep-withered-glade-ahsn5skc-pooler.c-3.us-east-1.aws.neon.tech/AI-mock-interview?sslmode=require&channel_binding=require
GEMINI_API_KEY=AI

# Keep these:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YWxpdmUtbWFjYXctMjYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_Kxk2a9kXTNbEM9oQyvGw3vgxNKrk1Z24sQ9Ljn7gdG
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Step 3: Verify Build (2 minutes)

```bash
npm run build
```

Should show ✅ no TypeScript errors

### Step 4: Update Components (1 minute)

**Option A: Full Refactor** (recommended)
- Update `Addnew.tsx` to use `useCreateInterview`
- Update `Recordanwser.tsx` to use custom hooks
- See examples below

**Option B: Gradual Adoption** (safe)
- Keep existing components as-is
- Use new hooks only in new features
- Migrate existing components later

---

## Code Examples

### Example 1: useCreateInterview

**Before:**
```tsx
const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobPosition, jobDesc, jobExperience }),
    });
    const data = await res.json();
    if (res.ok) {
      const mockId = crypto.randomUUID();
      const resp = await db.insert(MockInterview).values({
        mockId,
        jsonMockResp: JSON.stringify(data),
        jobPosition,
        jobDesc,
        jobExperience: String(jobExperience),
        createdBy: user?.primaryEmailAddress?.emailAddress || "unknown",
        createdAt: new Date().toISOString(),
      }).returning({ mockId: MockInterview.mockId });
      router.push(`/dashboard/interview/${resp[0]?.mockId}`);
    }
  } catch (err) {
    alert("Error");
  } finally {
    setLoading(false);
  }
};
```

**After:**
```tsx
import { useCreateInterview } from "@/app/hooks/useCreateInterview";

const { state, createNewInterview } = useCreateInterview();

const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  await createNewInterview({
    jobPosition,
    jobDesc,
    jobExperience
  });
};

// In JSX:
<Button disabled={state.loading}>
  {state.loading ? "Creating..." : "Create"}
</Button>
```

### Example 2: useSpeechRecognition

**Before:**
```tsx
const recognitionRef = useRef<any>(null);
const [isRecording, setIsRecording] = useState(false);
const [userAnswer, setUserAnswer] = useState("");

useEffect(() => {
  const SpeechRecognition: any = 
    (globalThis as any).SpeechRecognition ||
    (globalThis as any).webkitSpeechRecognition;
    
  if (!SpeechRecognition) {
    console.error("Not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognitionRef.current = recognition;
  recognition.continuous = true;
  recognition.interimResults = true;
  
  recognition.onstart = () => setIsRecording(true);
  recognition.onresult = (event: Event) => {
    // Complex event handling...
  };
  recognition.onend = () => setIsRecording(false);
}, []);

const handleStart = () => {
  recognitionRef.current?.start();
};
```

**After:**
```tsx
import { useSpeechRecognition } from "@/app/hooks/useSpeechRecognition";

const { isRecording, transcript, startRecording, stopRecording, error } = 
  useSpeechRecognition();

// In JSX:
<button onClick={isRecording ? stopRecording : startRecording}>
  {isRecording ? "Stop" : "Start"}
</button>
<p>{transcript}</p>
{error && <span className="error">{error}</span>}
```

### Example 3: useFeedback

**Before:**
```tsx
const [feedback, setFeedback] = useState(null);
const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

const handleGetFeedback = async () => {
  setIsFeedbackLoading(true);
  try {
    const feedbackprompt = "Question: " + question + "\nAnswer: " + userAnswer + "\n...";
    const result = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: feedbackprompt }),
    });
    
    if (!result.ok) {
      throw new Error(`API error: ${result.status}`);
    }
    
    const feedbackData = await result.json();
    setFeedback({
      rating: feedbackData.rating || 5,
      feedback: feedbackData.feedback || "No feedback",
      strengths: feedbackData.strengths || [],
      improvements: feedbackData.improvements || [],
    });
  } catch (error) {
    console.error("Feedback error:", error);
  } finally {
    setIsFeedbackLoading(false);
  }
};
```

**After:**
```tsx
import { useFeedback } from "@/app/hooks/useFeedback";

const { feedback, isLoading, error, getFeedback } = useFeedback();

const handleGetFeedback = async () => {
  const prompt = `Question: ${question}\nAnswer: ${userAnswer}`;
  await getFeedback(prompt);
};

// In JSX:
{isLoading && <p>Getting feedback...</p>}
{feedback && (
  <div>
    <p>Rating: {feedback.rating}/10</p>
    <p>{feedback.feedback}</p>
  </div>
)}
{error && <p className="error">{error}</p>}
```

### Example 4: useRecordingAnswer

**Before:**
```tsx
const [userAnswer, setUserAnswer] = useState("");
const [isEditing, setIsEditing] = useState(false);
const [feedback, setFeedback] = useState(null);

const handleReset = () => {
  setUserAnswer("");
  setIsEditing(false);
  setFeedback(null);
};

const handleSaveAnswer = async () => {
  try {
    const valuesToInsert = {
      mockIdRef: mockId,
      question: question,
      UserAns: userAnswer,
      correctanswer: correctanswer,
      score: String(feedbackData.rating || 5),
      feedback: feedbackData.feedback || "",
      userEmail: user.primaryEmailAddress.emailAddress,
      createdAt: new Date().toISOString(),
      createdBy: user.primaryEmailAddress.emailAddress,
      isSkipped: "false",
    };
    
    const resp = await db.insert(UserAnswer).values(valuesToInsert);
    toast.success("Saved!");
  } catch (dbError) {
    toast.error("Failed to save");
  }
};
```

**After:**
```tsx
import { useRecordingAnswer } from "@/app/hooks/useRecordingAnswer";

const { state, setUserAnswer, saveAnswerToDatabase, resetAnswer } = 
  useRecordingAnswer();

const handleSave = async () => {
  await saveAnswerToDatabase({
    mockIdRef: mockId,
    question,
    UserAns: state.userAnswer,
    correctanswer,
    score: String(state.feedback?.rating || 5),
    feedback: state.feedback?.feedback || "",
    userEmail: user.primaryEmailAddress.emailAddress,
    createdAt: new Date().toISOString(),
    createdBy: user.primaryEmailAddress.emailAddress,
    isSkipped: "false",
  });
};

// In JSX:
<div>
  <input 
    value={state.userAnswer}
    onChange={(e) => setUserAnswer(e.target.value)}
  />
  <button onClick={handleSave}>Save</button>
  <button onClick={resetAnswer}>Clear</button>
</div>
```

---

## Common Patterns

### Pattern 1: Handling Loading States

```tsx
import { useCreateInterview } from "@/app/hooks/useCreateInterview";

export function MyComponent() {
  const { state, createNewInterview } = useCreateInterview();

  return (
    <div>
      <button disabled={state.loading}>
        {state.loading ? (
          <>
            <Loader className="animate-spin" />
            Creating interview...
          </>
        ) : (
          "Create Interview"
        )}
      </button>
      
      {state.error && (
        <div className="error">
          {state.error}
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Combining Multiple Hooks

```tsx
export function RecordingComponent() {
  const { isRecording, transcript, startRecording } = useSpeechRecognition();
  const { feedback, isLoading: feedbackLoading, getFeedback } = useFeedback();
  const { state, setUserAnswer, saveAnswerToDatabase } = useRecordingAnswer();

  const handleSubmit = async () => {
    setUserAnswer(transcript);
    
    const prompt = `Question: How would you...?\nAnswer: ${transcript}`;
    await getFeedback(prompt);
    
    // After feedback is received, save to database
    await saveAnswerToDatabase({
      // ... data
    });
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop" : "Start"}
      </button>
      
      <p>{transcript}</p>
      
      {feedbackLoading && <p>Getting feedback...</p>}
      {feedback && <FeedbackDisplay feedback={feedback} />}
      
      <button onClick={handleSubmit} disabled={feedbackLoading}>
        Submit Answer
      </button>
    </div>
  );
}
```

### Pattern 3: Error Handling

```tsx
export function MyComponent() {
  const { state, createNewInterview } = useCreateInterview();
  
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      // Log error for monitoring
      console.error("Interview creation failed:", state.error);
    }
  }, [state.error]);

  return (
    // ...
  );
}
```

---

## Troubleshooting

### Error: "Module not found"
```
Solution: Ensure all files are copied to correct directories
- app/types/interview.types.ts ✓
- app/hooks/*.ts ✓
- app/utils/*.ts ✓
```

### Error: "Cannot find name 'auth'"
```
Solution: Clerk auth is imported in API routes
- Install: npm install @clerk/nextjs (already installed)
- Make sure CLERK_SECRET_KEY is in .env.local
```

### Error: "Type 'unknown' is not assignable"
```
Solution: Use proper types from interview.types.ts
- Import: import { InterviewData } from "@/app/types/interview.types"
- Don't use: unknown, any
```

### Error: "Unauthorized" on API calls
```
Solution: Check Clerk authentication
- Verify user is logged in
- Check CLERK_SECRET_KEY in .env.local
- Verify auth() is called correctly in API routes
```

### Error: "Failed to generate questions"
```
Solution: Check Gemini API
- Verify GEMINI_API_KEY is set in .env.local
- Check API rate limits
- Verify request body has jobPosition, jobDesc, jobExperience
```

---

## Next Steps

### Immediate
1. ✅ Copy all new files
2. ✅ Update .env.local
3. ✅ Run `npm run build`
4. ✅ Test API endpoints

### Short Term
1. Update Addnew.tsx to use useCreateInterview
2. Update Recordanwser.tsx to use custom hooks
3. Run full workflow test
4. Deploy to staging

### Medium Term
1. Add unit tests for hooks
2. Add integration tests for API routes
3. Set up monitoring/logging
4. Add rate limiting

### Long Term
1. Add caching layer
2. Optimize database queries
3. Implement performance monitoring
4. Add analytics

---

## Quick Commands

```bash
# Verify TypeScript
npm run build

# Lint check
npm run lint

# Start dev server
npm run dev

# Check specific file
npx tsc --noEmit app/hooks/useCreateInterview.ts
```

---

## Support Resources

- 📖 REFACTORING_GUIDE.md - Detailed architecture guide
- 📊 ARCHITECTURE_DIAGRAM.md - Visual diagrams
- 💡 REFACTORING_SUMMARY.md - Summary of changes
- 🧪 interview.types.ts - All type definitions

---

**Ready to go?** Start with copying the files and run `npm run build` to verify everything works! 🚀
