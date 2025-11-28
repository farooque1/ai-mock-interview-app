# 🔒 Security Best Practices Implementation Guide

## Overview

This document details all security improvements implemented in the AI Mock Interview application.

---

## 1. Environment Variables - Never Expose Secrets

### ❌ BEFORE (VULNERABLE)

```env
NEXT_PUBLIC_DATABASE_URL=postgresql://...
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
```

**Why This is Dangerous:**
- `NEXT_PUBLIC_` prefix exposes variables to browser
- Anyone can view the database connection string
- Anyone can use the Gemini API key
- Database and API credentials are compromised

### ✅ AFTER (SECURE)

```env
# Private - Only accessible server-side
DATABASE_URL=postgresql://...
GEMINI_API_KEY=AIzaSy...

# Public - Safe to expose to browser
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### How to Fix:

1. **Update .env.local:**
   ```bash
   # Remove NEXT_PUBLIC_ prefix from secrets
   # Keep only for Clerk public keys
   ```

2. **Update db.tsx:**
   ```typescript
   // ✅ CORRECT - Uses private DATABASE_URL
   const sql = neon(process.env.DATABASE_URL!);
   ```

3. **Update ai.service.ts:**
   ```typescript
   // ✅ CORRECT - Uses private GEMINI_API_KEY
   const apiKey = process.env.GEMINI_API_KEY;
   ```

4. **Verify Build:**
   ```bash
   npm run build
   # Verify no NEXT_PUBLIC_DATABASE_URL or NEXT_PUBLIC_GEMINI_API_KEY in build output
   ```

---

## 2. Input Validation - Prevent Invalid/Malicious Data

### Validation Layers

#### Layer 1: Type Validation
```typescript
// ✅ CORRECT - Validates type before processing
const validation = validateString(value, 'jobPosition', {
  required: true,
  minLength: 2,
  maxLength: 100,
});

if (!validation.valid) {
  return errorResponse(validation.errors[0].message);
}
```

#### Layer 2: Schema Validation
```typescript
// ✅ CORRECT - Validates entire request against schema
const INTERVIEW_REQUEST_SCHEMA = {
  jobPosition: { type: 'string', required: true, minLength: 2, maxLength: 100 },
  jobDesc: { type: 'string', required: true, minLength: 10, maxLength: 1000 },
  jobExperience: { type: 'number', required: true, min: 0, max: 80 },
};
```

#### Layer 3: Sanitization
```typescript
// ✅ CORRECT - Sanitizes after validation
const cleanText = sanitizeText(userInput, { maxLength: 500 });
```

### Implementation in API Routes

```typescript
export async function POST(req: Request): Promise<Response> {
  // Step 1: Full validation pipeline
  const validation = await validateApiRequest(req, INTERVIEW_REQUEST_SCHEMA, {
    rateLimit: { enabled: true, limit: 10, windowMs: 60000 },
  });

  if (!validation.valid) {
    return buildErrorResponse(validation.errors || []);
  }

  // Step 2: Use validated & sanitized data
  const { jobPosition, jobDesc, jobExperience } = validation.data!;

  // Proceed safely...
}
```

---

## 3. Sanitization - Prevent XSS Attacks

### XSS Prevention

#### ❌ UNSAFE - Direct HTML Rendering
```typescript
// VULNERABLE - User input can inject scripts
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

#### ✅ SAFE - Sanitized Rendering
```typescript
import { SafeText, useSafeHtml } from '@/app/components/ErrorBoundary';

// Option 1: Text rendering (auto-escaped)
<SafeText text={userComment} maxLength={200} />

// Option 2: Sanitized HTML
const { __html } = useSafeHtml(userContent);
<div dangerouslySetInnerHTML={{ __html }} />
```

### Sanitization Functions

```typescript
import { sanitizeText, sanitizeHtml, escapeHtml } from '@/app/utils/security.utils';

// Remove all HTML tags
const cleanText = sanitizeText(userInput);
// Result: "User text without <script> tags"

// Allow safe HTML tags
const cleanHtml = sanitizeHtml(userContent);
// Result: "<p>Safe <strong>HTML</strong></p>"

// Escape special characters
const escaped = escapeHtml(userText);
// Result: "Text with &lt;tags&gt; escaped"
```

### Database Sanitization

```typescript
// ✅ CORRECT - Sanitize before storing
const userAnswer = sanitizeText(req.body.userAnswer);
await saveUserAnswer(mockIdRef, userAnswer);
```

---

## 4. SQL Injection Prevention

### Drizzle ORM Safe Practices

#### ❌ UNSAFE - String Interpolation
```typescript
// VULNERABLE - Allows SQL injection
const query = db.select().from(users).where(sql`id = ${userId}`);
```

#### ✅ SAFE - Parameterized Queries
```typescript
// CORRECT - Drizzle uses parameterized queries
const query = db.select().from(users).where(eq(users.id, userId));
```

### Verify Drizzle Usage

```typescript
// ✅ All of these are SAFE (parameterized):
eq(users.id, userId)
like(users.email, `%${email}%`)
and(eq(users.status, 'active'), gt(users.age, 18))
```

### Best Practice

```typescript
// 1. Validate input
const validation = validateString(email, 'email', { 
  pattern: EMAIL_REGEX 
});

// 2. Use Drizzle DSL (never string interpolation)
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, validation.data));
```

---

## 5. Authentication & Authorization

### Clerk Integration

#### ✅ CORRECT - Protect API Routes
```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request): Promise<Response> {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }

  // Proceed with authenticated user
}
```

### Rate Limiting per User

```typescript
// ✅ Rate limit by userId (authenticated)
const rateLimitCheck = checkRateLimit(userId, 10, 60000);

if (!rateLimitCheck.allowed) {
  return buildErrorResponse([
    { field: 'rateLimit', message: 'Too many requests' }
  ], 429);
}
```

---

## 6. CSRF Protection

### Understanding CSRF

CSRF (Cross-Site Request Forgery) is when attacker tricks user into performing unwanted actions.

### Implementation

```typescript
import { generateCsrfToken, constantTimeEqual } from '@/app/utils/security.utils';

// Server: Generate token
const token = generateCsrfToken();

// Store in secure session (httpOnly cookie)
// Send to client via form

// Client: Include token in request
fetch('/api/action', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  body: JSON.stringify(data),
});

// Server: Validate token
const clientToken = request.headers.get('X-CSRF-Token');
const isValid = constantTimeEqual(clientToken, storedToken);

if (!isValid) {
  return errorResponse('CSRF token invalid', 403);
}
```

---

## 7. Security Headers

### Headers Applied to All Responses

```typescript
import { applySecurityHeaders, SECURITY_HEADERS } from '@/app/utils/security.utils';

// Headers included:
{
  'X-Content-Type-Options': 'nosniff',           // Prevents MIME sniffing
  'X-Frame-Options': 'DENY',                     // Prevents clickjacking
  'X-XSS-Protection': '1; mode=block',           // Legacy XSS protection
  'Strict-Transport-Security': '...',            // Force HTTPS
  'Content-Security-Policy': "...",              // Restrict resource loading
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), ...',   // Restrict features
}
```

### Apply Headers Automatically

```typescript
export async function POST(req: Request): Promise<Response> {
  try {
    let response = buildSuccessResponse({ data: 'success' });
    response = applySecurityHeaders(response);
    return response;
  } catch (error) {
    let response = buildErrorResponse([...]);
    response = applySecurityHeaders(response);
    return response;
  }
}
```

---

## 8. Error Handling - Don't Expose Internal Details

### ❌ UNSAFE - Exposes Error Details
```typescript
// VULNERABLE - Tells attacker about internals
return Response.json({
  error: error.message,  // "Database connection failed"
  stack: error.stack,    // Full stack trace
});
```

### ✅ SAFE - Generic Error Message
```typescript
// CORRECT - Safe message, log internal details
console.error('[SECURITY] Internal Error:', {
  timestamp: new Date().toISOString(),
  message: error.message,
  stack: error.stack,
});

return Response.json({
  success: false,
  message: 'Unable to process request. Please try again.',
});
```

### Client-Side Error Boundaries

```typescript
import { ErrorBoundary, SafeErrorDisplay } from '@/app/components/ErrorBoundary';

// Wrap components to catch errors
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Or display error safely
<SafeErrorDisplay error={error} onRetry={handleRetry} />
```

---

## 9. Request Spoofing Prevention

### Verify User Identity

```typescript
// ✅ CORRECT - Verify user owns the resource
export async function POST(req: Request): Promise<Response> {
  const { userId } = await auth();
  const { mockIdRef } = await req.json();

  // Verify user owns this interview
  const interview = await db
    .select()
    .from(mockInterviews)
    .where(eq(mockInterviews.id, mockIdRef));

  if (!interview || interview.userId !== userId) {
    return errorResponse('Unauthorized', 401);
  }

  // Proceed...
}
```

---

## 10. Rate Limiting Implementation

### Prevent Brute Force & DoS

```typescript
import { rateLimiter } from '@/app/utils/security.utils';

// Check rate limit
const allowed = rateLimiter.isAllowed(userId, 10, 60000);

if (!allowed) {
  return new Response('Too many requests', {
    status: 429,
    headers: { 'Retry-After': '60' },
  });
}
```

---

## Implementation Checklist

### Phase 1: Environment & Infrastructure (DO FIRST)
- [ ] Update `.env.local` - Remove `NEXT_PUBLIC_` from DATABASE_URL
- [ ] Update `.env.local` - Remove `NEXT_PUBLIC_` from GEMINI_API_KEY
- [ ] Update `app/utils/db.tsx` - Use private DATABASE_URL
- [ ] Update `app/utils/ai.service.ts` - Uses private GEMINI_API_KEY (already done)
- [ ] Run `npm run build` - Verify no exposed secrets

### Phase 2: API Security
- [ ] Copy `app/utils/security.utils.ts` - Core security functions
- [ ] Copy `app/utils/validation.middleware.ts` - Validation pipeline
- [ ] Update `app/api/generate/route.ts` - Use validation middleware
- [ ] Update `app/api/feedback/route.ts` - Use validation middleware
- [ ] Add rate limiting to sensitive endpoints

### Phase 3: Client-Side Security
- [ ] Copy `app/components/ErrorBoundary.tsx` - Error handling
- [ ] Wrap root component with `<ErrorBoundary>`
- [ ] Update all user input rendering - Use `SafeText`
- [ ] Update form submissions - Add CSRF token if applicable

### Phase 4: Validation & Testing
- [ ] Test with invalid inputs (XSS attempts)
- [ ] Test with SQL injection payloads
- [ ] Test rate limiting
- [ ] Test error messages (should be generic)
- [ ] Run `npm run build` - Final verification

---

## Security Testing

### Test XSS Prevention

```bash
# Try to inject script in input
POST /api/generate
{
  "jobPosition": "<script>alert('XSS')</script>",
  "jobDesc": "React",
  "jobExperience": 5
}

# Expected: Input sanitized, no script execution
```

### Test SQL Injection Prevention

```bash
# Try SQL injection in input
POST /api/generate
{
  "jobPosition": "'; DROP TABLE users; --",
  "jobDesc": "React",
  "jobExperience": 5
}

# Expected: Input treated as literal string, query safe
```

### Test Rate Limiting

```bash
# Make 11+ requests in 60 seconds
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/generate \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"jobPosition":"Engineer","jobDesc":"React","jobExperience":5}'
done

# Expected: 429 Too Many Requests after 10 requests
```

---

## Monitoring & Logging

### Enable Security Logging

```typescript
// All security utils include console logs
// Check browser/server logs for:
// [SECURITY] Authentication failed
// [SECURITY] Validation errors
// [SECURITY] Rate limit exceeded
// [SECURITY] XSS attempt detected
```

### Production Setup

For production, integrate with:
- **Sentry** - Error tracking
- **DataDog** - Monitoring & logging
- **Auth0/Clerk** - Authentication
- **LogRocket** - Session replay

---

## Deployment Checklist

- [ ] All environment variables configured on hosting platform
- [ ] No NEXT_PUBLIC_ secrets in any file
- [ ] HTTPS enabled on all domains
- [ ] Security headers configured
- [ ] Rate limiting thresholds set appropriately
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] API keys rotated before deployment

---

## References

- [OWASP Top 10](https://owasp.org/Top10/)
- [Next.js Security Best Practices](https://nextjs.org/docs/going-to-production/security-headers)
- [Clerk Security](https://clerk.com/docs/security)
- [Drizzle ORM Safety](https://orm.drizzle.team/docs/safety)

---

## Support

For security questions or vulnerabilities:
1. Do NOT post in public issues
2. Contact security team
3. Follow responsible disclosure

---

**Status:** ✅ All security improvements implemented  
**Last Updated:** November 21, 2025
