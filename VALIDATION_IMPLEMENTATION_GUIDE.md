# Input Validation Implementation Guide

## Overview

This document covers the complete input validation system implemented in the AI Mock Interview application using Zod schemas, client-side React hooks, and server-side validation.

## Architecture

```
User Input
    ↓
Client-Side Validation (Real-time feedback)
    ↓
Form Submission
    ↓
API Request
    ↓
Server-Side Validation (Zod)
    ↓
Sanitization
    ↓
AI Processing
    ↓
Response Validation
    ↓
Database Storage
```

## Core Components

### 1. Validation Schemas (`app/utils/validation.schemas.ts`)

**Purpose:** Single source of truth for all input validation

**Key Features:**
- Zod schema definitions
- Validation limits constants
- Type-safe request/response validation
- Validation functions (throwing and safe versions)

**Validation Limits:**

```typescript
export const VALIDATION_LIMITS = {
  // Text fields
  JOB_POSITION_MIN: 2,           // "SE"
  JOB_POSITION_MAX: 100,         // "Senior Software Engineer..."
  JOB_DESC_MIN: 10,              // "React, Node"
  JOB_DESC_MAX: 2000,            // Full tech stack description
  USER_ANSWER_MIN: 5,            // "Yes"
  USER_ANSWER_MAX: 5000,         // Long answer
  
  // Numeric fields
  EXPERIENCE_MIN: 0,             // Fresh graduate
  EXPERIENCE_MAX: 80,            // Maximum career length
  RATING_MIN: 1,                 // Worst rating
  RATING_MAX: 10,                // Best rating
  
  // Arrays
  INTERVIEW_QUESTIONS_MIN: 5,    // Minimum questions
  INTERVIEW_QUESTIONS_MAX: 10,   // Maximum questions
};
```

**Schema Types:**

```typescript
// Base Schemas (reusable)
jobPositionSchema: z.string().min(2).max(100).trim()
jobDescSchema: z.string().min(10).max(2000).trim()
experienceSchema: z.number().int().min(0).max(80)
userAnswerSchema: z.string().min(5).max(5000)

// Request Schemas (for API endpoints)
createInterviewRequestSchema: { jobPosition, jobDesc, jobExperience }
generateFeedbackRequestSchema: { mockIdRef, userAnswer }
saveAnswerRequestSchema: { mockIdRef, question, UserAns, email }

// Response Schemas (for AI-generated content)
createInterviewResponseSchema: { questions: [...] }
feedbackResponseSchema: { rating, feedback, strengths, improvements }
```

**Validation Functions:**

```typescript
// Throwing version (for critical paths)
export function validateCreateInterviewRequest(data: unknown): CreateInterviewRequest

// Safe version (returns result, doesn't throw)
export function safeValidateCreateInterviewRequest(data: unknown): 
  { success: true; data: CreateInterviewRequest } | 
  { success: false; errors: Record<string, string[]> }

// Form-friendly validation
export function validateField(fieldName: string, value: unknown): string | null
export function validateForm(formData: Record<string, unknown>): Record<string, string[]>
```

### 2. Client-Side Validation Hooks (`app/hooks/useFormValidation.ts`)

**Purpose:** Real-time validation with user feedback

**Main Hook: `useCreateInterviewValidation()`**

```typescript
const {
  formData,                    // Current form values
  setFormData,                 // Update form values
  validationState,             // { errors, isValid, isDirty }
  handleChange,                // Input change handler
  handleBlur,                  // Input blur handler (marks as touched)
  resetForm,                   // Reset to initial state
  getFormData,                 // Get typed form data
  isValid,                     // Is entire form valid?
  errors,                      // Current validation errors
  touchedFields,               // Fields user has interacted with
} = useCreateInterviewValidation();
```

**Features:**
- Real-time field validation
- Touch tracking (show errors only after user interaction)
- Type-safe data retrieval
- Form reset capability

**Other Hooks:**

```typescript
// Feedback validation
useGenerateFeedbackValidation()

// Character counting with limits
useCharacterCounter(fieldName: string)
// Returns: { count, max, remaining, isNearLimit, isExceeded, percentage }

// Field-specific validation
useJobPositionValidation()
useJobDescValidation()
useExperienceValidation()
useAnswerValidation()

// Debounced validation (reduces excessive re-renders)
useDebouncedValidation(delay: 300)

// Bulk form validation
useFormValidation<T>(schema: any)
```

### 3. Form Components (`app/components/FormComponents.tsx`)

**Purpose:** Type-safe reusable form fields with built-in validation

**Components:**

```typescript
// Text input with validation
<FormField
  name="jobPosition"
  label="Job Position"
  value={value}
  onChange={handleChange}
  error={errors.jobPosition}
  touched={touchedFields.has('jobPosition')}
  required
  maxLength={100}
/>

// Textarea with character counter
<FormTextarea
  name="jobDesc"
  label="Job Description"
  value={value}
  onChange={handleChange}
  error={errors.jobDesc}
  showCharCount={true}
  maxLength={2000}
  minRows={4}
/>

// Number input
<FormNumberInput
  name="jobExperience"
  label="Years of Experience"
  value={value}
  min={0}
  max={80}
/>

// Form wrapper
<FormContainer
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  submitButtonText="Generate"
  showResetButton={true}
>
  {/* Form fields */}
</FormContainer>

// Other components
<FormSelect />           // Dropdown
<FormCheckbox />         // Checkbox
<ValidationError />      // Error message display
<InlineValidationMessage /> // Info/warning/success messages
```

### 4. API Route Validation (`app/api/generate/route_validated.ts`)

**Validation Pipeline:**

1. **Authentication** → Clerk userId check
2. **Parse Request** → JSON parsing with error handling
3. **Validate Request** → Zod schema validation
4. **Sanitize Input** → Remove malicious content
5. **Call AI Service** → Gemini API
6. **Parse Response** → Extract JSON from markdown/text
7. **Validate Response** → Zod schema validation
8. **Sanitize Output** → Clean AI-generated content
9. **Store in DB** → Save with metadata
10. **Return Success** → Type-safe response

**Example Implementation:**

```typescript
export async function POST(req: Request): Promise<Response> {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // 2. Parse JSON
  const body = await req.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
      status: 400,
    });
  }

  // 3. Validate request
  const validationResult = safeValidateCreateInterviewRequest(body);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({ success: false, error: 'Validation failed', errors: validationResult.errors }),
      { status: 400 }
    );
  }

  // 4. Sanitize
  const sanitized = {
    jobPosition: sanitizeText(validationResult.data.jobPosition),
    jobDesc: sanitizeText(validationResult.data.jobDesc),
    jobExperience: validationResult.data.jobExperience,
  };

  // 5-9. AI processing, response validation, sanitization...

  // 10. Success response
  return new Response(
    JSON.stringify({ success: true, data: { ...sanitized, questions } }),
    { status: 200 }
  );
}
```

## Usage Examples

### Example 1: Using the validation hook in a component

```typescript
'use client';

import { useCreateInterviewValidation } from '@/app/hooks/useFormValidation';
import { FormField, FormTextarea } from '@/app/components/FormComponents';

export default function CreateInterviewForm() {
  const {
    formData,
    handleChange,
    handleBlur,
    errors,
    touchedFields,
    getFormData,
  } = useCreateInterviewValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validatedData = getFormData();
    if (!validatedData) {
      console.error('Form validation failed');
      return;
    }
    
    // Send to API
    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    });
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        name="jobPosition"
        label="Position"
        value={formData.jobPosition}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.jobPosition?.message}
        touched={touchedFields.has('jobPosition')}
      />
      {/* ... */}
    </form>
  );
}
```

### Example 2: Custom validation for specific use case

```typescript
import {
  validateField,
  validateForm,
  type CreateInterviewRequest,
} from '@/app/utils/validation.schemas';

// Validate single field
const positionError = validateField('jobPosition', 'S'); // Too short
// Result: "String must contain at least 2 character(s)"

// Validate entire form
const formData = {
  jobPosition: '',
  jobDesc: 'React',  // Too short
  jobExperience: -1, // Invalid
};
const errors = validateForm(formData);
// Result: { jobPosition: [...], jobDesc: [...], jobExperience: [...] }
```

### Example 3: Type-safe API response handling

```typescript
import { type CreateInterviewResponse, validateCreateInterviewResponse } from '@/app/utils/validation.schemas';

async function processAIResponse(data: unknown) {
  try {
    const validated = validateCreateInterviewResponse(data);
    // validated is now typed as CreateInterviewResponse
    console.log(`Got ${validated.questions.length} questions`);
  } catch (error) {
    console.error('Invalid response structure:', error);
  }
}
```

## Validation Rules Summary

| Field | Min | Max | Type | Rules |
|-------|-----|-----|------|-------|
| Job Position | 2 | 100 | string | Trimmed, required |
| Job Description | 10 | 2000 | string | Trimmed, required |
| Experience | 0 | 80 | number | Integer, ≥0, ≤80 |
| User Answer | 5 | 5000 | string | Trimmed, required |
| Rating | 1 | 10 | number | Integer |
| Email | - | 255 | string | Valid email format |

## Security Features

### Input Validation
- ✅ Type checking at runtime
- ✅ Length validation prevents buffer overflow
- ✅ Numeric range validation
- ✅ Pattern validation (emails, etc.)

### Sanitization
- ✅ HTML entity encoding
- ✅ Script tag removal
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS attack prevention

### API Security
- ✅ Clerk authentication required
- ✅ Private environment variables (GEMINI_API_KEY, DATABASE_URL)
- ✅ Safe error messages (no internal details exposed)
- ✅ Security headers (X-Frame-Options, X-XSS-Protection, etc.)

## Error Handling

### Client-Side
```typescript
if (validationState.errors.jobPosition) {
  // Show error tooltip
  // Highlight field in red
  // Disable submit button
}
```

### Server-Side
```typescript
if (!validationResult.success) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Validation failed',
      errors: validationResult.errors,
    }),
    { status: 400 }
  );
}
```

## Testing Validation

### Test Cases

```typescript
// Test 1: Valid input
const validInput = {
  jobPosition: 'Senior Engineer',
  jobDesc: 'React, Node.js, PostgreSQL',
  jobExperience: 5,
};
const result = safeValidateCreateInterviewRequest(validInput);
// Should pass

// Test 2: Too short job position
const shortPosition = {
  jobPosition: 'S', // Min is 2
  jobDesc: 'React, Node.js, PostgreSQL',
  jobExperience: 5,
};
// Should fail: "String must contain at least 2 character(s)"

// Test 3: Negative experience
const negativeExperience = {
  jobPosition: 'Senior Engineer',
  jobDesc: 'React, Node.js, PostgreSQL',
  jobExperience: -1, // Min is 0
};
// Should fail: "Number must be greater than or equal to 0"

// Test 4: XSS attempt
const xssAttempt = {
  jobPosition: '<script>alert("xss")</script>',
  jobDesc: 'React, Node.js, PostgreSQL',
  jobExperience: 5,
};
// Should pass validation (sanitized later), but get sanitized

// Test 5: Too long job description
const tooLongDesc = {
  jobPosition: 'Senior Engineer',
  jobDesc: 'a'.repeat(2001), // Max is 2000
  jobExperience: 5,
};
// Should fail: "String must contain at most 2000 character(s)"
```

## Performance Considerations

1. **Debounced Validation**: Real-time validation is debounced to reduce re-renders
2. **Touch Tracking**: Errors only show after user interaction
3. **Client-Side First**: Fail fast before API call
4. **Selective Sanitization**: Only sanitize user inputs, not schema-validated data

## Migration Guide

To integrate validation into existing components:

1. Replace old form state with validation hook:
   ```typescript
   // Old
   const [jobPosition, setJobPosition] = useState('');
   
   // New
   const { formData, handleChange } = useCreateInterviewValidation();
   // Use formData.jobPosition instead
   ```

2. Update form fields to use FormComponents:
   ```typescript
   // Old
   <input value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} />
   
   // New
   <FormField
     name="jobPosition"
     value={formData.jobPosition}
     onChange={handleChange}
     error={errors.jobPosition?.message}
   />
   ```

3. Update API calls to use validated data:
   ```typescript
   // Old
   const res = await fetch('/api/generate', {
     body: JSON.stringify({ jobPosition, jobDesc, jobExperience }),
   });
   
   // New
   const validatedData = getFormData();
   if (!validatedData) return; // Validation failed
   const res = await fetch('/api/generate', {
     body: JSON.stringify(validatedData),
   });
   ```

## Files Created/Modified

### New Files
- `app/utils/validation.schemas.ts` - Zod schemas and validation functions
- `app/hooks/useFormValidation.ts` - React validation hooks
- `app/components/FormComponents.tsx` - Type-safe form components
- `app/api/generate/route_validated.ts` - Secure API route with validation
- `app/dashboard/_component/Addnew_refactored.tsx` - Example component using validation

### Documentation
- `VALIDATION_IMPLEMENTATION_GUIDE.md` - This file
- `VALIDATION_QUICK_START.md` - Quick reference

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Validation not triggering | Check if handlers are connected to `handleChange` and `handleBlur` |
| Errors showing before interaction | Ensure `touched` check is working correctly |
| Type mismatches | Use `getFormData()` to get properly typed data |
| API returns 400 with validation errors | Check error response for `errors` field with details |
| Performance issues with real-time validation | Enable debouncing with `useDebouncedValidation` |

## Best Practices

1. **Always validate on server** - Never trust client-side validation alone
2. **Use safe versions for client** - Safe validation returns results instead of throwing
3. **Use throwing versions for critical paths** - When validation MUST succeed
4. **Sanitize after validation** - Validation checks type/length, sanitization removes harmful content
5. **Show user-friendly errors** - Display validation errors in real-time, not after form submission
6. **Test validation rules** - Create comprehensive test cases for all validation scenarios
7. **Keep limits in constants** - Maintain VALIDATION_LIMITS as single source of truth
8. **Type your API responses** - Always validate AI-generated content before storing

## Related Documentation

- [SECURITY_BEST_PRACTICES.md](./SECURITY_BEST_PRACTICES.md) - Security patterns
- [SECURITY_IMPLEMENTATION_REPORT.md](./SECURITY_IMPLEMENTATION_REPORT.md) - Implementation details
- [Zod Documentation](https://zod.dev) - Runtime schema validation
