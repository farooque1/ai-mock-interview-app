# UserAnswer Database Insertion - Debug & Fix

## 🐛 Issues Found & Fixed

### 1. **Schema Field Mismatch** ❌ → ✅
**Problem:**
```typescript
// OLD - Incorrect column name mapping
mockIdRef: varchar("mockId").notNull(),
```
- Field name was `mockIdRef` but column name was `mockId`
- This created confusion in the database schema

**Solution:**
```typescript
// NEW - Consistent naming
mockIdRef: varchar("mockIdRef").notNull(),
```

---

### 2. **Data Type Mismatch** ❌ → ✅
**Problem:**
```typescript
score: feedbackData.rating || 5,  // Inserting number into varchar field
```
- Score field defined as `varchar` but inserting a number
- PostgreSQL type coercion issues

**Solution:**
```typescript
score: String(feedbackData.rating || 5),  // Explicitly convert to string
```

---

### 3. **Missing Error Handling** ❌ → ✅
**Problem:**
```typescript
const resp = await db.insert(UserAnswer).values({...});
console.log("resp db answer", resp);
if(resp) { toast.success(...); }  // Vague error handling
```
- No try-catch around database operation
- Could silently fail

**Solution:**
```typescript
try {
  const resp = await db.insert(UserAnswer).values({...});
  console.log("✅ Answer saved to database:", resp);
  toast.success("Answer and feedback saved successfully!");
} catch (dbError) {
  console.error("❌ Database error:", dbError);
  toast.error("Failed to save answer to database. Please try again.");
  throw dbError;
}
```

---

### 4. **Type Safety Issues** ❌ → ✅
**Problem:**
```typescript
mockIdRef: interviewData?.mockId,  // interviewData is 'unknown' type
userEmail: user?.primaryEmailAddress?.emailAddress || "unknown",  // Using "unknown" as fallback
```
- Accessing properties on `unknown` type without proper type assertion
- Using "unknown" string as fallback loses real error visibility

**Solution:**
```typescript
// Extract mockId safely with type assertion
const mockIdRef = (interviewData as { mockId?: string })?.mockId;
if (!mockIdRef) {
  toast.error("Interview ID not found. Cannot save answer.");
  return;
}

// Validate user email exists
if (!user?.primaryEmailAddress?.emailAddress) {
  toast.error("User email not found. Cannot save answer.");
  return;
}

// Use actual values, no "unknown" fallback
userEmail: user.primaryEmailAddress.emailAddress,
```

---

### 5. **Unused Code** ❌ → ✅
**Removed:**
- Unused `isLoading` state variable
- Commented out validation code
- Unused imports

---

## 📋 Schema Updates

### Before:
```typescript
export const UserAnswer = pgTable("userAnswer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockId").notNull(),        // ❌ Wrong column name
  question: text("question").notNull(),
  UserAnswer: text("UserAnswer").notNull(),
  correctanswer: text("correctanswer").notNull(),
  score: varchar("score").notNull(),             // ✓ Correct (varchar)
  feedback: text("feedback").notNull(),
  userEmail: varchar("userEmail").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt")                // ❌ Missing .notNull()
});
```

### After:
```typescript
export const UserAnswer = pgTable("userAnswer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockIdRef").notNull(),     // ✅ Correct column name
  question: text("question").notNull(),
  UserAnswer: text("UserAnswer").notNull(),
  correctanswer: text("correctanswer").notNull(),
  score: varchar("score").notNull(),
  feedback: text("feedback").notNull(),
  userEmail: varchar("userEmail").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt").notNull(),     // ✅ Added .notNull()
});
```

---

## 🔧 Component Updates

### Insert Logic - Before:
```typescript
const resp = await db.insert(UserAnswer).values({
  mockIdRef: interviewData?.mockId,
  question: question,
  UserAnswer: userAnswer,
  correctanswer: correctanswer,
  score: feedbackData.rating || 5,              // ❌ Number instead of string
  feedback: feedbackData.feedback || "",
  userEmail: user?.primaryEmailAddress?.emailAddress || "unknown",
  createdAt: new Date().toISOString(),
  createdBy: user?.primaryEmailAddress?.emailAddress || "unknown",
});
console.log("resp db answer", resp);

if(resp) {
  toast.success("Answer and feedback saved to database.");
}
```

### Insert Logic - After:
```typescript
// Validate required data
const mockIdRef = (interviewData as { mockId?: string })?.mockId;
if (!mockIdRef) {
  toast.error("Interview ID not found. Cannot save answer.");
  return;
}

if (!user?.primaryEmailAddress?.emailAddress) {
  toast.error("User email not found. Cannot save answer.");
  return;
}

// Insert with proper error handling
try {
  const resp = await db.insert(UserAnswer).values({
    mockIdRef: mockIdRef,
    question: question,
    UserAnswer: userAnswer,
    correctanswer: correctanswer,
    score: String(feedbackData.rating || 5),   // ✅ Convert to string
    feedback: feedbackData.feedback || "",
    userEmail: user.primaryEmailAddress.emailAddress,
    createdAt: new Date().toISOString(),
    createdBy: user.primaryEmailAddress.emailAddress,
  });
  console.log("✅ Answer saved to database:", resp);
  toast.success("Answer and feedback saved successfully!");
} catch (dbError) {
  console.error("❌ Database error:", dbError);
  toast.error("Failed to save answer to database. Please try again.");
  throw dbError;
}
```

---

## 🚀 Testing Checklist

After deploying these changes:

- [ ] Run `npm run db:push` to update the schema
- [ ] Record an answer
- [ ] Check browser console for success/error logs
- [ ] Verify data appears in database
- [ ] Check for correct data types in table
- [ ] Test with missing mockId (should show error)
- [ ] Test without user logged in (should show error)
- [ ] Verify toast notifications appear correctly

---

## 📊 Expected Database Output

```sql
SELECT * FROM "userAnswer" WHERE "mockIdRef" = '...';

-- Expected columns:
-- id: 1
-- mockIdRef: "abc123def456"  (VARCHAR - from interview ID)
-- question: "What is React?"
-- UserAnswer: "React is..."
-- correctanswer: "Correct answer text..."
-- score: "7"  (VARCHAR, not INT)
-- feedback: "Good explanation but..."
-- userEmail: "user@example.com"
-- createdBy: "user@example.com"
-- createdAt: "2025-11-17T10:30:00.000Z"
```

---

## 💡 Key Takeaways

1. Always match field names with column names in schema
2. Type conversions matter - convert numbers to strings for varchar fields
3. Use proper try-catch for database operations
4. Validate required data before inserting
5. Provide specific error messages, not generic fallbacks
6. Add proper logging for debugging
