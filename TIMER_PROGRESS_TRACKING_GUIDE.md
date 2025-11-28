# Interview Timer, Progress Bar & Question Tracking - Implementation Guide

## 📋 Overview
This document outlines all the changes made to add:
- ⏱️ **30-minute countdown timer**
- 📊 **Progress bar tracking** (completed vs skipped questions)
- 🎯 **Question counter** (e.g., "Question 3 / 5")
- ⏭️ **Skip question functionality**
- ✅ **Completion tracking** for analytics

---

## 🗂️ Files Created & Modified

### 1. **NEW: `InterviewHeader.tsx`** ✨
**Location:** `app/dashboard/interview/[interviewId]/start/_component/InterviewHeader.tsx`

**Purpose:** Displays interview header with timer, progress bar, and stats

**Key Features:**
- 30-minute countdown timer with warning states
- Real-time progress bar (0-100%)
- Question counter display
- Completion/Skip statistics
- Time-up alerts

**Time-based color coding:**
- 🟢 **Green**: > 5 minutes left
- 🟠 **Orange**: 1-5 minutes left
- 🔴 **Red**: < 1 minute left (critical)

**Component Props:**
```typescript
interface InterviewHeaderProps {
  totalQuestions: number;
  completedQuestions: number;
  skippedQuestions: number;
  currentQuestionIndex: number;
  isInterviewActive: boolean;
  onTimeUp?: () => void;
}
```

---

### 2. **UPDATED: `schema.ts`**
**Location:** `app/utils/schema.ts`

**Changes Made:**
```typescript
// NEW FIELD ADDED to UserAnswer table:
isSkipped: varchar("isSkipped").default("false"),
```

**Purpose:** Track whether a question was answered or skipped

**Migration Required:**
Run: `npm run db:push`

---

### 3. **UPDATED: `page.tsx`**
**Location:** `app/dashboard/interview/[interviewId]/start/page.tsx`

**Major Changes:**

#### New State Variables:
```typescript
const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
const [isInterviewActive, setIsInterviewActive] = useState(true);
```

#### New Event Handlers:
```typescript
// Mark question as completed
const handleQuestionCompleted = (index: number) => {
  if (!completedQuestions.includes(index)) {
    setCompletedQuestions([...completedQuestions, index]);
  }
  setSkippedQuestions(skippedQuestions.filter((q) => q !== index));
};

// Mark question as skipped
const handleQuestionSkipped = (index: number) => {
  if (!skippedQuestions.includes(index)) {
    setSkippedQuestions([...skippedQuestions, index]);
  }
  setCompletedQuestions(completedQuestions.filter((q) => q !== index));
};

// Handle interview time expiration
const handleTimeUp = () => {
  setIsInterviewActive(false);
  console.log("⏰ Interview time is up!");
};
```

#### New Component Props:
```typescript
<InterviewHeader
  totalQuestions={mockInterviewQuestions.length}
  completedQuestions={completedQuestions.length}
  skippedQuestions={skippedQuestions.length}
  currentQuestionIndex={currentQuestionIndex}
  isInterviewActive={isInterviewActive}
  onTimeUp={handleTimeUp}
/>

<Recordanwser
  // ... existing props
  onQuestionCompleted={handleQuestionCompleted}
  onQuestionSkipped={handleQuestionSkipped}
/>
```

---

### 4. **UPDATED: `Recordanwser.tsx`**
**Location:** `app/dashboard/interview/[interviewId]/start/_component/Recordanwser.tsx`

**Changes Made:**

#### Updated Props Interface:
```typescript
interface RecordAnswerProps {
  readonly mockInterviewQuestions: unknown[];
  readonly currentQuestionIndex: number;
  readonly interviewData: unknown;
  readonly onQuestionCompleted?: (index: number) => void;
  readonly onQuestionSkipped?: (index: number) => void;
}
```

#### New Handler:
```typescript
const handleSkipQuestion = () => {
  onQuestionSkipped?.(currentQuestionIndex);
  setUserAnswer("");
  setIsEditing(false);
  setFeedback(null);
  toast.info("Question skipped. Moving to next question.");
};
```

#### Updated Save Handler:
```typescript
const handleSaveAnswerDB = () => {
  // Mark question as completed
  onQuestionCompleted?.(currentQuestionIndex);
  setUserAnswer("");
  setIsEditing(false);
  setFeedback(null);
  toast.success("Answer saved! Ready for next question.");
};
```

#### Updated Database Insertion:
```typescript
const valuesToInsert = {
  mockIdRef: mockIdRef,
  question: question,
  UserAns: userAnswer,
  correctanswer: correctanswer,
  score: String(feedbackData.rating || 5),
  feedback: feedbackData.feedback || "",
  userEmail: user.primaryEmailAddress.emailAddress,
  createdAt: new Date().toISOString(),
  createdBy: user.primaryEmailAddress.emailAddress,
  isSkipped: "false",  // ✅ NEW: Track non-skipped answers
};
```

#### New UI Button:
```typescript
// Skip Button (added to action buttons)
<Button
  onClick={handleSkipQuestion}
  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 text-xs rounded font-medium"
>
  ⏭ Skip
</Button>
```

---

### 5. **CREATED: `progress.tsx`** 🆕
**Location:** `components/ui/progress.tsx`

**Purpose:** Custom progress bar component

**Features:**
- Smooth animation
- Percentage-based width calculation
- Tailwind CSS styling

```typescript
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;  // 0-100 percentage
}
```

---

## 🔄 User Flow

### Interview Timeline:

```
┌─────────────────────────────────────────────────────┐
│  Interview Start                                    │
│  Timer: 30:00 (MM:SS)                              │
│  Progress: 0%                                       │
│  Questions: 0/5                                     │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│  User Records Answer                                │
│  Gets AI Feedback & Rating                          │
│  Clicks: Save Answer / Skip / Edit                  │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│  Click "Save Answer"                                │
│  → onQuestionCompleted() triggered                  │
│  → Question added to completedQuestions[]           │
│  → Data saved to database with isSkipped: "false"   │
│  → Progress updates                                 │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│  OR Click "Skip"                                    │
│  → onQuestionSkipped() triggered                    │
│  → Question added to skippedQuestions[]             │
│  → Progress updates (counts as completed)           │
│  → No database entry for skipped questions          │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│  Timer counts down                                  │
│  At 00:00 → isInterviewActive = false              │
│  User cannot record new answers                    │
│  Time Up alert shown                               │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Header Display

```
┌──────────────────────────────────────────────────────┐
│  Question Progress: 2/5                              │
│  ✓ Completed: 1    ⏭ Skipped: 1                     │
│                         ⏱ Time Left: 25:30          │
├──────────────────────────────────────────────────────┤
│  Overall Progress: 40%                               │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

| Element | Color | Meaning |
|---------|-------|---------|
| Progress Bar | Blue `#2563eb` | Primary action |
| Completed Badge | Green `#059669` | Completed successfully |
| Skipped Badge | Yellow `#ca8a04` | Skipped |
| Timer (>5min) | Green `#059669` | Good |
| Timer (1-5min) | Orange `#ea580c` | Warning |
| Timer (<1min) | Red `#dc2626` | Critical |

---

## 🧪 Testing Checklist

- [ ] Timer starts at 30:00 and counts down
- [ ] Progress bar updates when answering questions
- [ ] Progress bar shows 0% at start, 100% when all questions completed/skipped
- [ ] Question counter increments correctly
- [ ] Completed counter increases when "Save Answer" clicked
- [ ] Skipped counter increases when "Skip" clicked
- [ ] Timer color changes at 5 minutes and 1 minute marks
- [ ] "Time Up!" alert shows when timer reaches 00:00
- [ ] Database saves isSkipped: "false" for answered questions
- [ ] No database entry created for skipped questions
- [ ] Questions can be edited after recording
- [ ] Edit/Clear/Skip/Save buttons all work correctly

---

## 🔧 Setup Instructions

### 1. Update Database Schema
```bash
npm run db:push
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Navigate to Interview
Go to: `http://localhost:3000/dashboard/interview/[interviewId]/start`

---

## 📈 Database Records

### Answered Question:
```json
{
  "mockIdRef": "mock_123",
  "question": "What is React?",
  "UserAns": "React is a JavaScript library...",
  "correctanswer": "Expected answer text...",
  "score": "8",
  "feedback": "Good explanation...",
  "userEmail": "user@example.com",
  "createdBy": "user@example.com",
  "createdAt": "2025-11-20T10:30:00.000Z",
  "isSkipped": "false"
}
```

### Skipped Question:
```
No database entry created
(Only tracked in skippedQuestions[] state array)
```

---

## ⚙️ Configuration

### Timer Duration:
To change from 30 minutes, edit in `InterviewHeader.tsx`:
```typescript
const [timeLeft, setTimeLeft] = useState(30 * 60); // Change this number
// 30 * 60 = 1800 seconds = 30 minutes
// 25 * 60 = 1500 seconds = 25 minutes
// 20 * 60 = 1200 seconds = 20 minutes
```

### Warning Thresholds:
Edit in `InterviewHeader.tsx`:
```typescript
const getTimerBgClass = () => {
  if (isTimeUp) return "bg-red-100 border-2 border-red-500";
  if (timeLeft <= 60) return "bg-red-100...";  // < 1 minute warning
  if (timeLeft <= 300) return "bg-orange-100...";  // < 5 minute warning
  return "bg-blue-100...";  // Safe
};
```

---

## 🚀 Future Enhancements

- [ ] Save interview session state to localStorage
- [ ] Resume interview functionality
- [ ] Skip question database tracking for analytics
- [ ] Submit final answers button at the end
- [ ] Interview summary screen after time expires
- [ ] Performance graphs and statistics
- [ ] Adjust timer per question
- [ ] Sound notification when time is running out

---

## 📞 Support

If issues occur:

1. **Timer not starting**: Check `useEffect` dependencies in `InterviewHeader.tsx`
2. **Progress not updating**: Verify `handleQuestionCompleted` is being called
3. **Database errors**: Run `npm run db:push` again
4. **Components not rendering**: Check all imports in `page.tsx`

Run: `npm run build` to catch any TypeScript errors

