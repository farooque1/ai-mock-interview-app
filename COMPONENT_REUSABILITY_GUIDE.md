# Component Reusability Guide

Complete guide to using the new reusable components, hooks, and utilities system for the AI Mock Interview application.

---

## 📦 New Reusable Modules

### 1. **SharedComponents.tsx** (1,200+ LOC)
Centralized UI component library with 20+ reusable components.

**Location:** `app/components/SharedComponents.tsx`

### 2. **api.helpers.ts** (560 LOC)
Centralized API calling, data fetching, and state management utilities.

**Location:** `app/utils/api.helpers.ts`

### 3. **useCustomHooks.ts** (1,000+ LOC)
Business logic hooks for common patterns.

**Location:** `app/hooks/useCustomHooks.ts`

---

## 🎨 UI Components (SharedComponents.tsx)

### **Loading States**

#### **Loader** - Simple spinner
```tsx
import { Loader } from '@/app/components/SharedComponents';

export function MyComponent() {
  return <Loader size="md" />;
}
```

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Spinner size
- `className?: string` - Custom styling

#### **LoadingState** - Spinner with message
```tsx
<LoadingState 
  message="Generating interview questions..." 
  size="lg"
/>
```

**Props:**
- `message?: string` - Loading message
- `size?: 'sm' | 'md' | 'lg'` - Spinner size

#### **SkeletonLoader** - Placeholder animation
```tsx
<SkeletonLoader 
  count={3} 
  height={100} 
  className="mb-4"
/>
```

**Props:**
- `count?: number` - Number of skeleton lines
- `height?: number` - Height in pixels
- `className?: string` - Custom styling

---

### **Card Components**

#### **Card** - Container with border and shadow
```tsx
<Card>
  <CardHeader title="Interview Details" />
  <CardContent>
    <p>Interview information here</p>
  </CardContent>
  <CardFooter>
    <button>Cancel</button>
    <button>Save</button>
  </CardFooter>
</Card>
```

**Props:**
- `children: ReactNode`
- `className?: string`
- `hoverable?: boolean` - Add hover effect

---

### **Modal Components**

#### **Modal** - Reusable dialog
```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Create New Interview"
>
  <form onSubmit={handleSubmit}>
    <input name="title" placeholder="Interview title" />
    <button type="submit">Create</button>
  </form>
</Modal>
```

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `title?: string` - Modal title
- `children: ReactNode`
- `size?: 'sm' | 'md' | 'lg'` - Modal size
- `closeButton?: boolean` - Show X button

#### **ConfirmDialog** - Yes/No confirmation
```tsx
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Delete Interview?"
  message="This action cannot be undone."
  onConfirm={handleDelete}
  confirmText="Delete"
  cancelText="Keep"
  isDangerous={true}
/>
```

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `title: string`
- `message: string`
- `onConfirm: () => void`
- `confirmText?: string` - Default: "Confirm"
- `cancelText?: string` - Default: "Cancel"
- `isDangerous?: boolean` - Red confirm button

---

### **Progress Components**

#### **ProgressBar** - Linear progress
```tsx
<ProgressBar 
  current={7} 
  total={10} 
  label="Question 7 of 10"
/>
```

**Props:**
- `current: number` - Current progress
- `total: number` - Total value
- `label?: string` - Display label
- `showPercentage?: boolean`

#### **CircularProgress** - Circular progress
```tsx
<CircularProgress 
  percentage={65} 
  size="md"
  label="65%"
/>
```

**Props:**
- `percentage: number` - Progress 0-100
- `size?: 'sm' | 'md' | 'lg'`
- `label?: string`
- `strokeWidth?: number`

#### **StepIndicator** - Multi-step indicator
```tsx
<StepIndicator 
  steps={['Personal', 'Interview', 'Review']}
  currentStep={1}
/>
```

**Props:**
- `steps: string[]` - Step labels
- `currentStep: number` - Active step (0-indexed)

---

### **Message Components**

#### **SuccessMessage** - Success alert
```tsx
<SuccessMessage 
  message="Interview saved successfully!"
  onClose={() => setMessage(null)}
/>
```

#### **ErrorMessage** - Error alert
```tsx
<ErrorMessage 
  message="Failed to save interview. Please try again."
  onClose={() => setError(null)}
/>
```

#### **WarningMessage** - Warning alert
```tsx
<WarningMessage 
  message="You will be timed during this interview."
  onClose={() => setWarning(null)}
/>
```

#### **InfoMessage** - Info alert
```tsx
<InfoMessage 
  message="Interviews are recorded for quality assurance."
  onClose={() => setInfo(null)}
/>
```

**Common Props:**
- `message: string` - Alert message
- `onClose?: () => void` - Close handler
- `className?: string`

---

### **Layout Components**

#### **Container** - Responsive width container
```tsx
<Container size="lg">
  <h1>My Dashboard</h1>
  <p>Content here</p>
</Container>
```

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Max width
- `children: ReactNode`
- `className?: string`

#### **Section** - Content section with header
```tsx
<Section 
  title="Interview Questions"
  subtitle="Practice questions for this interview"
>
  <div>Questions here</div>
</Section>
```

**Props:**
- `title?: string`
- `subtitle?: string`
- `children: ReactNode`
- `className?: string`

#### **Grid** - Responsive grid layout
```tsx
<Grid columns={3} gap="lg">
  <Card>Interview 1</Card>
  <Card>Interview 2</Card>
  <Card>Interview 3</Card>
</Grid>
```

**Props:**
- `columns?: number | Record<string, number>` - Grid columns
- `gap?: 'sm' | 'md' | 'lg'` - Gap size
- `children: ReactNode`

---

### **Utility Components**

#### **EmptyState** - No content message
```tsx
<EmptyState 
  title="No Interviews"
  message="Create your first interview to get started"
  actionLabel="Create Interview"
  onAction={() => navigate('/create')}
/>
```

#### **Badge** - Tag/label component
```tsx
<Badge variant="primary">In Progress</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Failed</Badge>
```

#### **Divider** - Horizontal line
```tsx
<Divider label="Or continue with" />
```

---

## 🪝 API Utilities (api.helpers.ts)

### **useQuery** - Data fetching hook

**Basic Usage:**
```tsx
import { useQuery } from '@/app/utils/api.helpers';

export function InterviewList() {
  const { data: interviews, loading, error } = useQuery<Interview[]>(
    '/api/interviews'
  );

  if (loading) return <LoadingState message="Loading interviews..." />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      {interviews?.map(interview => (
        <Card key={interview.id}>{interview.title}</Card>
      ))}
    </div>
  );
}
```

**Advanced Usage with Options:**
```tsx
const { data, loading, error, refetch } = useQuery<Interview[]>(
  '/api/interviews',
  {
    enabled: true, // Enable/disable fetching
    refetchInterval: 5000, // Refetch every 5 seconds
    onSuccess: (data) => console.log('Loaded:', data),
    onError: (error) => console.error('Error:', error),
    retry: 3, // Retry 3 times on failure
  }
);

// Manual refetch
<button onClick={() => refetch()}>Refresh</button>
```

**Return Value:**
```tsx
{
  data: T | null,           // Fetched data
  loading: boolean,         // Loading state
  error: ApiError | null,   // Error if failed
  isLoading: boolean,       // Alias for loading
  isError: boolean,         // Is there an error?
  isSuccess: boolean,       // Did it succeed?
  refetch: () => Promise<T> // Manual refetch
}
```

---

### **useMutation** - Data mutation hook

**Basic Usage:**
```tsx
import { useMutation } from '@/app/utils/api.helpers';

export function CreateInterview() {
  const { mutate, loading, error } = useMutation<
    Interview, 
    { title: string; position: string }
  >('/api/interviews', { method: 'POST' });

  const handleSubmit = async (formData) => {
    try {
      const result = await mutate(formData);
      console.log('Created:', result);
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ title: 'React Interview', position: 'Senior' });
    }}>
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create Interview'}
      </button>
      {error && <ErrorMessage message={error.message} />}
    </form>
  );
}
```

**Advanced Usage:**
```tsx
const { mutate, loading, error, reset } = useMutation<User, UpdateUserData>(
  '/api/users/profile',
  {
    method: 'PUT',
    headers: {
      'X-Custom-Header': 'value'
    },
    onSuccess: (data) => {
      console.log('User updated:', data);
      // Invalidate cache, navigate, etc.
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  }
);

// Call mutation
await mutate({ name: 'John', email: 'john@example.com' });

// Reset state
<button onClick={() => reset()}>Clear</button>
```

**Return Value:**
```tsx
{
  mutate: (data: TVariables) => Promise<TData>,
  loading: boolean,
  error: ApiError | null,
  isLoading: boolean,
  isError: boolean,
  isSuccess: boolean,
  reset: () => void
}
```

---

### **useCachedQuery** - Query with caching

```tsx
const { data, loading, error, cache } = useCachedQuery<Interview>(
  `/api/interviews/${id}`,
  { 
    ttl: 300000, // Cache for 5 minutes
    enabled: !!id 
  }
);

// Manually invalidate cache
cache.invalidate(`/api/interviews/${id}`);
```

---

### **HTTP Methods**

#### **apiGet** - GET request
```tsx
const data = await apiGet<Interview[]>('/api/interviews');
```

#### **apiPost** - POST request
```tsx
const result = await apiPost<Interview>(
  '/api/interviews',
  { title: 'React Interview', position: 'Senior' }
);
```

#### **apiPut** - PUT request
```tsx
const updated = await apiPut<Interview>(
  `/api/interviews/${id}`,
  { title: 'Updated Title' }
);
```

#### **apiDelete** - DELETE request
```tsx
await apiDelete(`/api/interviews/${id}`);
```

---

### **Batch Operations**

#### **batchRequests** - Parallel requests
```tsx
const [interviews, questions, feedback] = await batchRequests([
  () => apiGet<Interview[]>('/api/interviews'),
  () => apiGet<Question[]>('/api/questions'),
  () => apiGet<Feedback[]>('/api/feedback')
]);
```

#### **sequentialRequests** - Sequential requests
```tsx
const results = await sequentialRequests([
  () => apiPost('/api/interviews', interviewData),
  () => apiPost('/api/questions', questionsData),
  () => apiPost('/api/feedback', feedbackData)
]);
```

---

### **Error Handling**

#### **ApiError** - Extended Error class
```tsx
import { ApiError } from '@/app/utils/api.helpers';

try {
  await apiGet('/api/invalid');
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Details:', error.errors);
  }
}
```

#### **getErrorMessage** - User-friendly error messages
```tsx
import { getErrorMessage } from '@/app/utils/api.helpers';

<ErrorMessage message={getErrorMessage(error)} />
```

#### **withRetry** - Automatic retry logic
```tsx
import { withRetry } from '@/app/utils/api.helpers';

const result = await withRetry(
  () => apiGet('/api/data'),
  { maxRetries: 3, delayMs: 1000 }
);
```

---

## 🎯 Custom Hooks (useCustomHooks.ts)

### **useTimer** - Interview countdown
```tsx
import { useTimer } from '@/app/hooks';

export function InterviewTimer() {
  const { seconds, isRunning, start, stop, reset, progress } = useTimer(600);

  return (
    <div>
      <CircularProgress percentage={progress * 100} />
      <p>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### **useDebounce** - Debounce values
```tsx
import { useDebounce } from '@/app/hooks';

export function SearchInterviews() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedTerm) {
      // Search API call
    }
  }, [debouncedTerm]);

  return <input onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

### **useLocalStorage** - Persist to localStorage
```tsx
import { useLocalStorage } from '@/app/hooks';

export function UserPreferences() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [language, setLanguage] = useLocalStorage('language', 'en');

  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
        />
        Dark Mode
      </label>
    </div>
  );
}
```

### **usePrevious** - Track previous value
```tsx
import { usePrevious } from '@/app/hooks';

export function QuestionTracker() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const prevQuestion = usePrevious(currentQuestion);

  return <p>Changed from question {prevQuestion} to {currentQuestion}</p>;
}
```

### **useAsync** - Async operations
```tsx
import { useAsync } from '@/app/hooks';

export function LoadInterview() {
  const { data, loading, error } = useAsync(
    () => apiGet(`/api/interviews/${id}`),
    true // immediate execution
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error.message} />;

  return <div>{data.title}</div>;
}
```

### **useBoolean** - Toggle state
```tsx
import { useBoolean } from '@/app/hooks';

export function InterviewSettings() {
  const { value: isRecording, toggle } = useBoolean(false);

  return (
    <button onClick={toggle}>
      {isRecording ? 'Stop Recording' : 'Start Recording'}
    </button>
  );
}
```

### **useArray** - Array operations
```tsx
import { useArray } from '@/app/hooks';

export function QuestionList() {
  const { array: questions, push, remove, filter } = useArray<Question>([]);

  return (
    <div>
      <button onClick={() => push(newQuestion)}>Add</button>
      {questions.map((q, i) => (
        <div key={i}>
          {q.text}
          <button onClick={() => remove(i)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### **useObject** - Object operations
```tsx
import { useObject } from '@/app/hooks';

export function FormState() {
  const { object, set, merge } = useObject({ name: '', email: '' });

  return (
    <form>
      <input 
        value={object.name}
        onChange={(e) => set('name', e.target.value)}
      />
      <button onClick={() => merge({ email: 'new@email.com' })}>
        Set Email
      </button>
    </form>
  );
}
```

### **useForm** - Simplified form management
```tsx
import { useForm } from '@/app/hooks';

export function InterviewForm() {
  const { values, handleChange, handleSubmit, isSubmitting } = useForm(
    { title: '', position: '', duration: 30 },
    async (values) => {
      await apiPost('/api/interviews', values);
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="title" 
        value={values.title}
        onChange={handleChange}
      />
      <button disabled={isSubmitting} type="submit">
        Create
      </button>
    </form>
  );
}
```

### **useClickOutside** - Detect clicks outside
```tsx
import { useClickOutside } from '@/app/hooks';

export function Dropdown() {
  const [isOpen, setIsOpen] = useState(true);
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  return (
    <div ref={ref}>
      {isOpen && <Menu />}
    </div>
  );
}
```

### **useCopyToClipboard** - Copy text
```tsx
import { useCopyToClipboard } from '@/app/hooks';

export function ShareInterview() {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <button onClick={() => copy('https://interview.com/abc123')}>
      {isCopied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}
```

### **useMediaQuery** - Responsive queries
```tsx
import { useMediaQuery } from '@/app/hooks';

export function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

### **useWindowSize** - Get window dimensions
```tsx
import { useWindowSize } from '@/app/hooks';

export function DynamicHeight() {
  const { width, height } = useWindowSize();

  return <div style={{ maxWidth: width - 32 }}>Content</div>;
}
```

### **useFetch** - Simple fetch hook
```tsx
import { useFetch } from '@/app/hooks';

export function InterviewStats() {
  const { data: stats, loading } = useFetch('/api/stats', {
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  if (loading) return <LoadingState />;
  return <StatsDisplay data={stats} />;
}
```

---

## 📋 Integration Examples

### **Complete Interview Form Component**

```tsx
'use client';

import { useState } from 'react';
import {
  Modal,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  LoadingState,
  ErrorMessage,
  SuccessMessage,
  Button,
} from '@/app/components/SharedComponents';
import { useForm, useLocalStorage } from '@/app/hooks';
import { useMutation } from '@/app/utils/api.helpers';

interface CreateInterviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (interview: Interview) => void;
}

export function CreateInterviewForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateInterviewFormProps) {
  const [success, setSuccess] = useState<string | null>(null);
  const [savedDefaults, setSavedDefaults] = useLocalStorage<{
    position?: string;
  }>('interviewDefaults', {});

  const { values, handleChange, handleSubmit, isSubmitting } = useForm(
    {
      title: '',
      position: savedDefaults?.position || '',
      duration: 30,
      difficulty: 'medium',
    },
    async (formValues) => {
      await mutate(formValues);
    }
  );

  const { mutate, loading, error } = useMutation<
    Interview,
    typeof values
  >('/api/interviews', { method: 'POST' });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    setSavedDefaults({ position: values.position });
    setSuccess('Interview created successfully!');
    setTimeout(() => {
      onClose();
      setSuccess(null);
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Interview">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {error && <ErrorMessage message={error.message} />}
        {success && <SuccessMessage message={success} />}

        <Card>
          <CardContent>
            <div className="space-y-3">
              <input
                type="text"
                name="title"
                placeholder="Interview title"
                value={values.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                name="position"
                placeholder="Job position"
                value={values.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <select
                name="difficulty"
                value={values.difficulty}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input
                type="number"
                name="duration"
                value={values.duration}
                onChange={handleChange}
                min="10"
                max="120"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Interview'}
          </button>
        </CardFooter>

        {loading && <LoadingState message="Creating interview..." />}
      </form>
    </Modal>
  );
}
```

### **Interview Recorder Component (Refactored)**

```tsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  LoadingState,
  ErrorMessage,
  ProgressBar,
  CircularProgress,
} from '@/app/components/SharedComponents';
import { useTimer, useBoolean } from '@/app/hooks';
import { useMutation } from '@/app/utils/api.helpers';

interface RecorderProps {
  interviewId: string;
  totalQuestions: number;
  currentQuestion: number;
  questionText: string;
}

export function InterviewRecorder({
  interviewId,
  totalQuestions,
  currentQuestion,
  questionText,
}: RecorderProps) {
  const [isRecording, setIsRecording] = useBoolean(false);
  const { seconds, start: startTimer, stop: stopTimer } = useTimer(120);

  const { mutate: saveAnswer, loading: saving, error } = useMutation(
    '/api/answers',
    { method: 'POST' }
  );

  const handleStartRecording = () => {
    setIsRecording.setTrue();
    startTimer();
  };

  const handleStopRecording = async () => {
    setIsRecording.setFalse();
    stopTimer();

    // Get audio from recorder and save
    await saveAnswer({
      interviewId,
      questionNumber: currentQuestion,
      audioBlob: 'audio_data_here', // Get from recorder
    });
  };

  return (
    <Card>
      <CardHeader title="Answer Question" />
      <CardContent className="space-y-4">
        <ProgressBar current={currentQuestion} total={totalQuestions} />

        <div className="text-lg font-semibold">{questionText}</div>

        <div className="flex justify-center">
          <CircularProgress
            percentage={(seconds / 120) * 100}
            size="lg"
            label={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}
          />
        </div>

        {error && <ErrorMessage message={error.message} />}
        {saving && <LoadingState message="Saving your answer..." />}

        <div className="flex gap-2 justify-center">
          <button
            onClick={handleStartRecording}
            disabled={isRecording || saving}
            className="px-6 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            {isRecording ? 'Recording...' : 'Start Recording'}
          </button>
          <button
            onClick={handleStopRecording}
            disabled={!isRecording || saving}
            className="px-6 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Stop Recording
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔧 Import Patterns

### **Option 1: Direct imports**
```tsx
import { Loader, Card, Modal } from '@/app/components/SharedComponents';
import { useQuery, useMutation } from '@/app/utils/api.helpers';
import { useTimer, useDebounce } from '@/app/hooks/useCustomHooks';
```

### **Option 2: Index imports (recommended)**
```tsx
import { Loader, Card, Modal } from '@/app/components/SharedComponents';
import { useTimer, useDebounce, useBoolean } from '@/app/hooks';
import { useQuery, useMutation } from '@/app/hooks'; // Also exported in index
```

### **Option 3: Namespace imports**
```tsx
import * as SharedComponents from '@/app/components/SharedComponents';
import * as Hooks from '@/app/hooks';

<SharedComponents.Modal />
Hooks.useTimer(600);
```

---

## ✅ Best Practices

### **1. Always use LoadingState/ErrorMessage**
```tsx
// ✅ Good
if (loading) return <LoadingState message="Loading..." />;
if (error) return <ErrorMessage message={error.message} />;

// ❌ Bad
if (loading) return <div>Loading...</div>;
if (error) return <div>Error</div>;
```

### **2. Use useMutation for side effects**
```tsx
// ✅ Good - Proper loading/error states
const { mutate, loading, error } = useMutation('/api/save', { method: 'POST' });

// ❌ Bad - No error handling
const handleSave = async (data) => {
  const response = await fetch('/api/save', { method: 'POST', body: JSON.stringify(data) });
};
```

### **3. Use useLocalStorage for user preferences**
```tsx
// ✅ Good - Persists across sessions
const [theme, setTheme] = useLocalStorage('theme', 'light');

// ❌ Bad - Lost on page refresh
const [theme, setTheme] = useState('light');
```

### **4. Use useTimer for timed interactions**
```tsx
// ✅ Good - Complete timer control
const { seconds, isRunning, start, stop, reset } = useTimer(600);

// ❌ Bad - Manual timer logic
const [seconds, setSeconds] = useState(600);
```

### **5. Use Batch operations for multiple API calls**
```tsx
// ✅ Good - Parallel execution
const [interviews, questions] = await batchRequests([
  () => apiGet('/api/interviews'),
  () => apiGet('/api/questions'),
]);

// ❌ Bad - Sequential (slower)
const interviews = await apiGet('/api/interviews');
const questions = await apiGet('/api/questions');
```

---

## 📊 Component Registry

| Component | Category | File | LOC |
|-----------|----------|------|-----|
| Loader | Loading | SharedComponents.tsx | 20 |
| LoadingState | Loading | SharedComponents.tsx | 25 |
| SkeletonLoader | Loading | SharedComponents.tsx | 30 |
| Card/CardHeader/CardContent/CardFooter | Container | SharedComponents.tsx | 60 |
| Modal | Dialog | SharedComponents.tsx | 50 |
| ConfirmDialog | Dialog | SharedComponents.tsx | 55 |
| ProgressBar | Progress | SharedComponents.tsx | 35 |
| CircularProgress | Progress | SharedComponents.tsx | 45 |
| StepIndicator | Progress | SharedComponents.tsx | 40 |
| SuccessMessage | Alert | SharedComponents.tsx | 20 |
| ErrorMessage | Alert | SharedComponents.tsx | 20 |
| WarningMessage | Alert | SharedComponents.tsx | 20 |
| InfoMessage | Alert | SharedComponents.tsx | 20 |
| Container | Layout | SharedComponents.tsx | 30 |
| Section | Layout | SharedComponents.tsx | 35 |
| Grid | Layout | SharedComponents.tsx | 40 |
| EmptyState | Utility | SharedComponents.tsx | 35 |
| Badge | Utility | SharedComponents.tsx | 25 |
| Divider | Utility | SharedComponents.tsx | 20 |

| Hook | Purpose | File | Use Cases |
|------|---------|------|-----------|
| useQuery | Data fetching | api.helpers.ts | Load interview data, questions |
| useMutation | Data mutation | api.helpers.ts | Create/update/delete operations |
| useCachedQuery | Cached fetching | api.helpers.ts | Frequently accessed data |
| useTimer | Countdown | useCustomHooks.ts | Interview timer, time limits |
| useDebounce | Value debounce | useCustomHooks.ts | Search, filter inputs |
| useLocalStorage | Persist state | useCustomHooks.ts | User preferences, form drafts |
| usePrevious | Previous value | useCustomHooks.ts | Track changes |
| useAsync | Async handler | useCustomHooks.ts | Async operations |
| useBoolean | Boolean toggle | useCustomHooks.ts | Modal, checkbox state |
| useArray | Array operations | useCustomHooks.ts | List management |
| useObject | Object operations | useCustomHooks.ts | Form state |
| useForm | Form management | useCustomHooks.ts | Form handling |
| useClickOutside | Click detection | useCustomHooks.ts | Dropdown close |
| useCopyToClipboard | Copy text | useCustomHooks.ts | Share links |
| useMediaQuery | Responsive | useCustomHooks.ts | Mobile detection |
| useWindowSize | Window size | useCustomHooks.ts | Dynamic layouts |
| useFetch | Simple fetch | useCustomHooks.ts | Basic API calls |

---

## 🚀 Next Steps

1. **Update existing components** to use SharedComponents instead of duplicated UI code
2. **Replace API calls** with useQuery and useMutation
3. **Use custom hooks** for business logic
4. **Test thoroughly** before deployment
5. **Monitor performance** and optimize as needed

---

**Created:** 2024
**Last Updated:** 2024
**Components:** 20+ UI components
**Hooks:** 17 custom hooks + API utilities
**Total LOC:** 2,700+
