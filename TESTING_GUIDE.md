# Step-by-Step Testing Guide: Timer, Progress Bar & Question Tracking

## 🚀 Quick Start

### Step 1: Push Database Changes
```bash
cd d:\ai-mock-interview
npm run db:push
```
✅ This adds the `isSkipped` field to the `userAnswer` table

---

### Step 2: Start Development Server
```bash
npm run dev
```
🔗 Open: `http://localhost:3000`

---

### Step 3: Navigate to Interview
1. Go to Dashboard
2. Create a new mock interview OR select an existing one
3. Click "Start Interview"
4. You should see the new header with timer and progress bar

---

## 📊 What to Look For

### Header Components:

```
┌─ INTERVIEW HEADER (NEW) ────────────────────────────┐
│                                                      │
│  Question Progress: 1 / 5        ✓ 0 Completed     │
│                         ⏭ 0 Skipped    ⏱ 29:45     │
├──────────────────────────────────────────────────────┤
│  Overall Progress: 0%                                │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Test Cases

### Test 1: Timer Countdown ⏱️

**Steps:**
1. Look at the timer display (top right)
2. Wait 10 seconds
3. Verify timer counts down (29:50 → 29:49 → ...)

**Expected Result:** ✅
- Timer shows MM:SS format
- Counts down in real-time
- Timer is blue (safe state)

---

### Test 2: Progress Bar Updates 📊

**Steps:**
1. Record an answer to first question
2. Get AI feedback
3. Click "✓ Save Answer" button
4. Watch the header

**Expected Result:** ✅
- Progress shows ~20% (1 out of 5 questions)
- "Completed: 1" badge appears
- Question counter shows "2 / 5"

---

### Test 3: Skip Functionality ⏭️

**Steps:**
1. Look at the buttons in answer section
2. Should see new orange "⏭ Skip" button
3. Click "Skip" button without recording anything
4. Check header

**Expected Result:** ✅
- "Skipped: 1" badge appears
- Progress bar updates (counts as progress)
- Question moves to next one
- Toast message: "Question skipped. Moving to next question."

---

### Test 4: Complete Mix (Answer + Skip)

**Steps:**
1. Record answer to Q1 → Save → Progress: 20%, Completed: 1
2. Skip Q2 → Progress: 40%, Skipped: 1
3. Record answer to Q3 → Save → Progress: 60%, Completed: 2
4. Skip Q4 → Progress: 80%, Skipped: 2
5. Record answer to Q5 → Save → Progress: 100%, Completed: 3

**Expected Result:** ✅
```
Question Progress: 5 / 5
✓ Completed: 3    ⏭ Skipped: 2
Overall Progress: 100%
```

---

### Test 5: Timer Warnings 🎨

**Steps:**
1. Wait until timer shows ~5 minutes left (04:59)
2. Observe timer color
3. Wait until ~1 minute left (00:59)
4. Observe color change

**Expected Result:** ✅
- At 5+ minutes: 🟢 **Green** (`#059669`)
- At 1-5 minutes: 🟠 **Orange** (`#ea580c`)
- At <1 minute: 🔴 **Red** (`#dc2626`)

---

### Test 6: Time Up Alert 🛑

**Steps:**
1. Wait for timer to reach 00:00
2. Observe header

**Expected Result:** ✅
- Red background on timer
- "TIME UP!" message appears
- Alert box shows: "🛑 Interview Time is Up! Submit your answers."
- `isInterviewActive` becomes `false`

---

### Test 7: Database Tracking 💾

**Steps:**
1. Complete answer to Q1 with feedback
2. Click "Save Answer"
3. Check browser console for:
   ```
   ✅ Answer saved to database
   ```
4. Check Drizzle Studio (if available)

**Expected Result:** ✅
- Console shows: `"✅ Insert response: ..."`
- Database entry has:
  - `isSkipped: "false"`
  - `score: "7"` (or whatever rating)
  - `feedback: "..."` (AI feedback text)

---

## 🔍 Browser Console Checks

Open **Developer Tools** → **Console** tab

You should see logs like:

```javascript
// Question completed
"✅ Answer saved to database:", {response_object}

// Question skipped
"Question skipped. Moving to next question."

// Timer status
"⏰ Interview time is up!"
```

---

## 🎯 Key Visual Changes

### Before (Old Version):
```
[Just webcam and recording]
```

### After (New Version):
```
┌─ HEADER (NEW) ─────────────┐
│ Timer | Progress | Counter │  ← ALL NEW
├─────────────────────────────┤
│ Question List | Recording   │  ← Existing
├─────────────────────────────┤
│  [✎ Edit] [✓ Save] [⏭Skip] │  ← Skip button NEW
└─────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: Timer not showing
**Solution:** 
- Refresh page
- Check browser console for errors
- Ensure `InterviewHeader` component is imported in `page.tsx`

### Issue: Progress bar not updating
**Solution:**
- Click "Save Answer" or "Skip" button
- Check console: should see completion handler calls
- Verify `onQuestionCompleted` callback is being invoked

### Issue: Skip button not appearing
**Solution:**
- Refresh page
- Clear browser cache: `Ctrl+Shift+Delete`
- Check that `Recordanwser.tsx` has been updated

### Issue: Database error when saving
**Solution:**
```bash
npm run db:push  # Re-sync schema
npm run dev      # Restart server
```

---

## 📱 Mobile Testing

The header should be responsive:

**Desktop (1920px):**
- Question counter on left
- Stats badges in middle
- Timer on right
- Progress bar spans full width

**Tablet (768px):**
- Stacked layout
- All elements visible
- Touch-friendly buttons

**Mobile (375px):**
- Vertical layout
- Timer prominently displayed
- Progress bar full width

---

## 🎬 Video Test Flow

Record yourself:

1. **Start Interview**
   - "See the new header with timer and progress"
   
2. **Record & Save Q1**
   - "Progress updates to 20%"
   - "Counter shows 2/5"
   
3. **Skip Q2**
   - "Orange skip button works"
   - "Progress updates to 40%"
   
4. **Save Q3**
   - "Back to 'Save Answer' button"
   - "Progress: 60%, Completed: 2"

---

## ✨ Expected Final Result

After all changes are deployed:

✅ 30-minute countdown timer visible
✅ Progress bar showing 0-100%
✅ Question counter (e.g., "2/5")
✅ Completed questions badge
✅ Skipped questions badge
✅ Skip button functionality
✅ Database tracking skipped status
✅ Time-up alerts
✅ All TypeScript errors resolved

---

## 🚨 Critical Files to Verify

```
✅ app/dashboard/interview/[interviewId]/start/page.tsx
✅ app/dashboard/interview/[interviewId]/start/_component/InterviewHeader.tsx
✅ app/dashboard/interview/[interviewId]/start/_component/Recordanwser.tsx
✅ app/utils/schema.ts
✅ components/ui/progress.tsx
✅ app/utils/db.tsx (should be unchanged)
```

All should have **ZERO** TypeScript errors

---

## 📊 Performance Notes

- Timer updates every 1 second (1000ms interval)
- Progress bar updates instantly on state change
- No database calls for skipped questions
- Minimal re-renders thanks to React optimization

---

## 🎉 Success Criteria

Your implementation is complete when:

1. ✅ Timer counts down every second
2. ✅ Progress bar fills as you complete/skip questions
3. ✅ Skip button appears and works
4. ✅ Database saves `isSkipped: "false"` for answered Qs
5. ✅ Header shows all stats correctly
6. ✅ No TypeScript compilation errors
7. ✅ Dev server runs without warnings

---

**Ready to test? Run:** `npm run dev`

