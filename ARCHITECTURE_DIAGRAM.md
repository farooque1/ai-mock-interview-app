# Architecture Diagram - AI Mock Interview Application

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Browser)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Addnew     │  │  RecordAnswer│  │   Question   │  │  Dashboard  │  │
│  │  Component   │  │  Component   │  │  Component   │  │ Component   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
│         │                 │                 │                  │         │
└─────────┼─────────────────┼─────────────────┼──────────────────┼─────────┘
          │                 │                 │                  │
┌─────────▼─────────────────▼─────────────────▼──────────────────▼─────────┐
│                         HOOKS LAYER                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │useCreateInterview  │  │useSpeechRecog    │  │useFeedback           │ │
│  ├────────────────────┤  ├──────────────────┤  ├──────────────────────┤ │
│  │✓ Validation       │  │✓ Browser check  │  │✓ API call           │ │
│  │✓ API call        │  │✓ Event handlers │  │✓ Response validation│ │
│  │✓ DB persistence  │  │✓ Cleanup        │  │✓ Error handling     │ │
│  │✓ Navigation      │  │✓ Permissions    │  │✓ Loading state      │ │
│  └────────────────────┘  └──────────────────┘  └──────────────────────┘ │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │               useRecordingAnswer                                  │  │
│  │  ✓ Answer state    ✓ Editing     ✓ DB saving    ✓ Feedback      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└───┬───────────────────────────────────────────────────────────────────┬──┘
    │                                                                     │
┌───▼────────────────────────────────────────────────────────────────────▼──┐
│                       SERVICE LAYER                                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐  │
│  │  AI Service      │  │ Database Service │  │  API Utils             │  │
│  ├──────────────────┤  ├──────────────────┤  ├────────────────────────┤  │
│  │• genQuestions()  │  │• createInterview │  │• Validation rules      │  │
│  │• genFeedback()   │  │• saveUserAnswer  │  │• Error formatting      │  │
│  │• JSON extract()  │  │• getInterview()  │  │• Response building     │  │
│  │• Response parse()│  │• Error handling  │  │• Input sanitization    │  │
│  └──────────────────┘  └──────────────────┘  └────────────────────────┘  │
│                                                                            │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │          String Utils (Formatting & Text Processing)             │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└──┬──────────────────────────────────────────────────────────────────┬─────┘
   │                                                                   │
┌──▼────────────────────────────────────────────────────────────────────▼──┐
│                    API ROUTES LAYER (Next.js)                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  POST /api/generate                      POST /api/feedback              │
│  ├─ Auth check (Clerk)                   ├─ Auth check (Clerk)         │
│  ├─ Input validation                     ├─ Input validation           │
│  ├─ AI Service                           ├─ AI Service                 │
│  ├─ Response formatting                  ├─ Response formatting        │
│  └─ Error handling                       └─ Error handling             │
│                                                                           │
└──┬──────────────────────────────────────────────────────────────────┬────┘
   │                                                                   │
   │                  ┌──────────────────────┐                        │
   │                  │  External Services   │                        │
   │                  └──────────────────────┘                        │
   │                                                                   │
┌──▼────────────────────────────────┬──────────────────────────────────▼──┐
│                                                                           │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │    Clerk       │  │  Google Gemini   │  │    PostgreSQL           │ │
│  │ (Auth Service) │  │   (AI Engine)    │  │   (Database)            │ │
│  │                │  │                  │  │                         │ │
│  │ • Auth users   │  │ • Gen questions  │  │ • Store interviews     │ │
│  │ • Manage       │  │ • Gen feedback   │  │ • Store answers        │ │
│  │   sessions     │  │ • Parse JSON     │  │ • User data            │ │
│  │                │  │                  │  │                         │ │
│  └────────────────┘  └──────────────────┘  └─────────────────────────┘ │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

```

## Data Flow Diagrams

### Interview Creation Flow

```
User Form Submission
        │
        ▼
useCreateInterview Hook
        │
        ├─ Validate inputs (required, length, type)
        ├─ Check user authentication
        │
        ▼
POST /api/generate
        │
        ├─ Verify Clerk auth token
        ├─ Validate request body
        │
        ▼
AI Service
        │
        ├─ Build prompt with job details
        ├─ Call Google Gemini API
        ├─ Parse JSON (4 fallback strategies)
        ├─ Validate response structure
        │
        ▼
Database Service
        │
        ├─ Create UUID for interview
        ├─ Save to MockInterview table
        │
        ▼
Success Response
        │
        └─ Navigate to Interview Page
        └─ Show success toast
```

### Answer Recording & Feedback Flow

```
User Starts Recording
        │
        ▼
useSpeechRecognition Hook
        │
        ├─ Check browser support
        ├─ Request mic permission
        ├─ Accumulate transcript
        │
        ▼
User Stops Recording
        │
        ▼
useRecordingAnswer Hook
        │
        ├─ Store answer text
        ├─ Allow editing
        │
        ▼
User Submits for Feedback
        │
        ▼
useFeedback Hook
        │
        ├─ Build feedback prompt
        │
        ▼
POST /api/feedback
        │
        ├─ Verify auth
        ├─ Validate prompt
        │
        ▼
AI Service
        │
        ├─ Call Gemini with structured prompt
        ├─ Extract rating (1-10)
        ├─ Extract feedback text
        ├─ Extract strengths
        ├─ Extract improvements
        │
        ▼
Database Service
        │
        ├─ Save UserAnswer record with:
        │  ├─ Question
        │  ├─ User answer
        │  ├─ Rating
        │  ├─ Feedback
        │  └─ Timestamp
        │
        ▼
Display Feedback to User
        │
        └─ Show score, feedback, strengths, improvements
```

## Type Safety Architecture

```
Types (interview.types.ts)
        │
        ├─ InterviewQuestion
        ├─ CreateInterviewRequest
        ├─ FeedbackResponse
        ├─ RecordingState
        └─ ... (20+ interfaces)
        │
        ▼
Hooks (useXxx.ts)
        │
        ├─ UseCreateInterviewReturn
        ├─ UseSpeechRecognitionReturn
        ├─ UseFeedbackReturn
        └─ UseRecordingAnswerReturn
        │
        ▼
Services (xxx.service.ts)
        │
        ├─ validateInterviewRequest()
        ├─ validateFeedbackRequest()
        ├─ createInterview()
        ├─ generateInterviewQuestions()
        └─ generateFeedback()
        │
        ▼
API Routes
        │
        └─ All inputs/outputs typed
            All responses follow standard format
```

## Error Handling Flow

```
Error Occurs
        │
        ├─ Try-catch block
        │
        ▼
logError() helper
        │
        ├─ Log to console
        ├─ Include context
        ├─ Include stack trace (if available)
        │
        ▼
Error Response Builder
        │
        ├─ HTTP Status Code
        ├─ Error message
        ├─ Details/validation errors
        │
        ▼
Client Toast Notification
        │
        └─ Display to user
```

## Security Architecture

```
Public Layer (Browser)
        │
        ├─ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ✓ (OK)
        │
        X NO DATABASE_URL
        X NO API KEYS
        │
        ▼
Private Layer (Server)
        │
        ├─ DATABASE_URL (private .env)
        ├─ GEMINI_API_KEY (private .env)
        ├─ CLERK_SECRET_KEY (private .env)
        │
        ▼
API Authentication
        │
        ├─ Clerk auth().userId check
        ├─ Return 401 if no auth
        │
        ▼
Input Validation
        │
        ├─ Type checking
        ├─ Length limits
        ├─ Format validation
        ├─ Sanitization
        │
        ▼
External Services (HTTPS)
        │
        ├─ Clerk
        ├─ Google Gemini
        └─ PostgreSQL (SSL)
```

## Performance Characteristics

```
Component              Size        Responsibility          Load Time
─────────────────────────────────────────────────────────────────────
Addnew.tsx            ~150 LOC    UI + useCreateInterview  ~50ms
RecordAnswer.tsx      ~150 LOC    UI + hooks              ~60ms
Question.tsx          ~100 LOC    Display                 ~30ms
Recordanswer.tsx      ~150 LOC    UI + recording          ~40ms

Hook                  Size        Responsibility          Runtime
─────────────────────────────────────────────────────────────────────
useCreateInterview    ~67 LOC     Interview creation      ~2s (API)
useSpeechRecognition  ~101 LOC    Speech recording        Real-time
useFeedback          ~57 LOC     Feedback fetching       ~3s (API)
useRecordingAnswer   ~86 LOC     Answer management       <100ms

Service               Size        Responsibility          Runtime
─────────────────────────────────────────────────────────────────────
ai.service.ts        ~227 LOC    AI operations           ~2-3s
database.service.ts  ~98 LOC     DB operations           ~200ms
api.utils.ts         ~213 LOC    Validation & formatting ~10ms
string.utils.ts      ~77 LOC     Text processing         <1ms

API Route             Size        Responsibility          Runtime
─────────────────────────────────────────────────────────────────────
/api/generate        ~50 LOC     Question generation     ~2-3s
/api/feedback        ~45 LOC     Feedback generation     ~2-3s
```

---

This architecture ensures:

✅ **Separation of Concerns:** Each layer has distinct responsibilities  
✅ **Type Safety:** Full TypeScript coverage  
✅ **Error Handling:** Consistent error handling throughout  
✅ **Security:** Proper authentication and validation  
✅ **Performance:** Optimized and efficient code  
✅ **Maintainability:** Clear, organized structure  
✅ **Testability:** Easy to unit and integration test  
✅ **Scalability:** Ready for future enhancements  
