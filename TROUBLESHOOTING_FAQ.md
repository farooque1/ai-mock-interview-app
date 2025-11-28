# 🔧 Troubleshooting & FAQ

## Frequently Asked Questions

### Q1: Where do I see the timer and progress bar?
**A:** At the top of the interview page, there's a new blue header section that displays:
- Timer countdown (top right)
- Progress bar (bottom)
- Question counter (top left)
- Completion statistics (center)

---

### Q2: The timer shows 29:59 instead of 30:00 - is that a bug?
**A:** No, that's normal. The countdown starts at 30:00 and begins immediately. By the time you see it, ~1 second may have passed.

---

### Q3: Can I pause the timer?
**A:** Currently, no. The timer runs continuously. A pause feature is on the roadmap for future updates.

---

### Q4: What happens when time runs out?
**A:** When the timer reaches 00:00:
- The header turns red with "TIME UP!" message
- `isInterviewActive` becomes false
- You should submit/save your current answers
- No new recordings can be started

---

### Q5: Do skipped questions get saved to the database?
**A:** No. Skipped questions only update the progress bar. They are NOT saved to the database. Only answered questions (with feedback) are recorded.

---

### Q6: Can I resume an interrupted interview?
**A:** Not currently. If your interview is interrupted, you would need to start over. This feature is planned.

---

### Q7: What if I accidentally click Skip?
**A:** If you skip a question:
1. The progress moves to the next question
2. A toast notification confirms the skip
3. You can't go back to that question (currently)
4. The skipped count increases

Consider re-recording the answer if you made a mistake.

---

### Q8: Can the timer be adjusted?
**A:** Yes, if you're a developer:
- Open `InterviewHeader.tsx`
- Line 28: Change `30 * 60` to desired minutes
- Redeploy

---

### Q9: Why is my progress stuck at 0%?
**A:** This means you haven't completed or skipped any questions yet. To update:
1. Record an answer
2. Click either "Save Answer" or "Skip"

---

### Q10: The progress bar shows 40% but I've only answered 1/5 questions?
**A:** The progress counts both completed AND skipped questions. So if you:
- Completed 1 question (20%)
- Skipped 1 question (20%)
- Total: 40%

---

## 🐛 Troubleshooting Guide

### Issue: Timer not appearing
**Cause:** Component not rendered or CSS issue

**Solutions:**
```bash
# 1. Hard refresh browser
Ctrl + Shift + Delete  # Clear cache

# 2. Restart dev server
npm run dev

# 3. Check browser console
Right-click → Inspect → Console tab
# Look for red errors
```

**If still not showing:**
- Verify `InterviewHeader` import in `page.tsx`
- Check that styles loaded in `globals.css`
- Try different browser (Chrome, Firefox)

---

### Issue: Timer not counting down
**Cause:** Timer interval not starting

**Solutions:**
1. Check browser console for errors
2. Verify `useEffect` dependency in `InterviewHeader.tsx`
3. Ensure `isInterviewActive` is `true`

**Code to check:**
```typescript
// InterviewHeader.tsx, useEffect with timer
useEffect(() => {
  if (!isInterviewActive || isTimeUp) return;  // ← Check these conditions
  
  const timer = setInterval(() => {
    // Timer logic here
  }, 1000);
  
  return () => clearInterval(timer);
}, [isInterviewActive, isTimeUp]);  // ← Should include dependencies
```

---

### Issue: Progress bar not updating after saving answer
**Cause:** Callback not triggered or state not updating

**Solutions:**

**Step 1:** Check browser console
```javascript
// You should see logs like:
// "✅ Answer saved to database"
```

**Step 2:** Verify button click worked
- Open DevTools → Console
- Look for any errors in red

**Step 3:** Restart dev server
```bash
npm run dev
```

---

### Issue: Skip button not appearing
**Cause:** Component not updated or styles hidden

**Solutions:**
1. **Clear cache and refresh:**
   ```bash
   Ctrl + Shift + Delete → Clear all
   Ctrl + Shift + R      → Hard refresh
   ```

2. **Verify button code exists:**
   - Open `Recordanwser.tsx`
   - Search for "Skip"
   - Should see orange button code

3. **Check button visibility:**
   - Open DevTools → Elements
   - Search for button with text "Skip"
   - Check if parent container is visible

---

### Issue: Database not saving data
**Cause:** Schema not updated or connection issue

**Solutions:**
```bash
# 1. Push latest schema changes
npm run db:push

# 2. Verify database connection in .env.local
cat .env.local | grep DATABASE

# 3. Restart dev server
npm run dev

# 4. Try recording answer again
```

**If connection error persists:**
- Check PostgreSQL/Neon connection string
- Verify firewall allows connections
- Check database credentials

---

### Issue: "Time Up!" doesn't show
**Cause:** Timer not reaching 00:00 or state not updating

**Solutions:**
1. Wait for timer to actually reach 00:00
   - It takes exactly 30 minutes
   - Or fast-forward by adjusting system clock (for testing)

2. For testing faster:
   ```typescript
   // Temporarily change in InterviewHeader.tsx line 28
   const [timeLeft, setTimeLeft] = useState(30);  // 30 seconds instead
   ```

3. Check console for timer logs
   ```javascript
   // You should see in console:
   // "⏰ Interview time is up!"
   ```

---

### Issue: Progress bar color is wrong
**Cause:** CSS not loading or color value incorrect

**Solutions:**
1. Check browser's computed styles:
   - DevTools → Elements
   - Select progress element
   - Check "Styles" panel

2. Verify Tailwind CSS loaded:
   - DevTools → Console
   - Type: `document.querySelector('[class*="bg-blue"]')`
   - Should return an element

3. Clear CSS cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

### Issue: Buttons overlapping or misaligned
**Cause:** CSS layout issue or responsive design problem

**Solutions:**
1. **Resize browser window:**
   - Desktop: Make window very wide/narrow
   - Mobile: Use DevTools device emulator

2. **Check button container:**
   - Should be flex layout
   - Gap between buttons: 8px
   - Responsive on smaller screens

3. **Inspect with DevTools:**
   - Right-click button → Inspect
   - Check parent div has `flex` class
   - Verify `gap-2` class applied

---

### Issue: Typo or misspelling in buttons
**Solutions:**
```bash
# Search for exact text
grep -r "Skip" app/  # Should show ⏭ Skip

# If missing, it's not updated
# Verify file was edited:
git diff Recordanwser.tsx
```

---

### Issue: Toast notifications not showing
**Cause:** Sonner library not imported or configured

**Solutions:**
1. Verify import in `Recordanwser.tsx`:
   ```typescript
   import { toast } from "sonner";
   ```

2. Check `Toaster` in layout:
   - Open `app/layout.tsx`
   - Should have: `<Toaster />`

3. Test toast manually:
   ```bash
   # Open browser console and run:
   # (if toast is exposed globally)
   ```

---

### Issue: "Cannot find module" errors
**Cause:** Missing imports or wrong file paths

**Solutions:**
```bash
# Verify all imports are correct
npm run build  # Will show all import errors

# If InterviewHeader not found:
# Make sure file exists at:
# app/dashboard/interview/[interviewId]/start/_component/InterviewHeader.tsx

# If progress.tsx not found:
# Make sure file exists at:
# components/ui/progress.tsx
```

---

## 🧪 Quick Verification Checklist

After deployment, verify:

- [ ] Timer visible in header
- [ ] Timer counts down every second
- [ ] Progress bar updates when saving answer
- [ ] Progress bar updates when skipping question
- [ ] Skip button visible in answer section
- [ ] Question counter shows current/total
- [ ] Completed badge shows green count
- [ ] Skipped badge shows yellow count
- [ ] Timer color: blue (green) → orange → red
- [ ] "TIME UP!" alert shows at 00:00
- [ ] Database saves `isSkipped: "false"` for answered questions
- [ ] No console errors in DevTools
- [ ] All buttons clickable and functional

---

## 🔍 Debug Commands

### View Component Props
```javascript
// In browser console
const el = document.querySelector('[class*="flex"][class*="flex-col"]');
console.log('Component rendered:', el ? 'YES' : 'NO');
```

### Check State Values
```javascript
// Open React DevTools
// Go to Components tab
// Select <InterviewHeader>
// In "Props" section, verify:
// - totalQuestions: number
// - completedQuestions: number
// - skippedQuestions: number
// - currentQuestionIndex: number
// - timeLeft: number (decreasing)
```

### View Console Logs
```bash
# Run in terminal while dev server running:
npm run dev 2>&1 | grep -i "answer\|timer\|skip"
```

### Check Database
```bash
# If using Drizzle Studio:
npm run db:studio

# Then navigate to userAnswer table
# Look for records with isSkipped: "false"
```

---

## 🚨 Critical Error Messages

### Error: "Cannot read property 'mockId' of null"
**Cause:** `interviewData` is null

**Solution:**
```bash
npm run db:push
# Restart dev server
```

### Error: "setCurrentQuestionIndex is not a function"
**Cause:** Props not passed correctly from parent

**Solution:**
- Check `page.tsx` line 109
- Verify `setCurrentQuestionIndex` passed to `Question` component

### Error: "onQuestionCompleted is not a function"
**Cause:** Callback not passed to `Recordanwser`

**Solution:**
- Check `page.tsx` line 118
- Verify `onQuestionCompleted` prop exists

---

## 📊 Performance Debugging

### Slow Timer
- Check browser performance: DevTools → Performance
- Record a trace while timer running
- Look for long tasks (> 50ms)
- May need to optimize re-renders

### Laggy Progress Bar
- Verify CSS uses GPU acceleration
- Check `transform` property used (not `width`)
- Reduce animation duration if needed

### Database Slow
- Check network: DevTools → Network
- Look for slow POST requests
- May need database optimization

---

## 🆘 Getting Help

If you're stuck:

1. **Check the docs first:**
   - `IMPLEMENTATION_SUMMARY.md` - Overview
   - `TIMER_PROGRESS_TRACKING_GUIDE.md` - Technical details
   - `TESTING_GUIDE.md` - Test cases
   - `VISUAL_COMPONENTS_GUIDE.md` - UI reference

2. **Search the codebase:**
   ```bash
   grep -r "InterviewHeader" app/  # Find all usages
   grep -r "onQuestionCompleted" app/  # Find all handlers
   ```

3. **Check browser console:**
   - Right-click → Inspect → Console tab
   - Look for red errors
   - Screenshot and note the error

4. **Review git changes:**
   ```bash
   git diff  # See all changes made
   git log --oneline | head -5  # Recent commits
   ```

---

## ✅ Success Indicators

Your implementation is working correctly when:

✅ Zero TypeScript errors on save
✅ Dev server running without warnings
✅ Timer counts down smoothly
✅ Progress bar updates instantly
✅ All buttons are clickable
✅ Toast notifications appear
✅ Database records appear correctly
✅ No console errors
✅ Responsive on all screen sizes
✅ Performance is smooth (no lag)

---

## 📞 Emergency Fixes

If everything breaks:

### Option 1: Clear and Rebuild
```bash
rm -rf .next node_modules
npm install
npm run db:push
npm run dev
```

### Option 2: Revert Changes
```bash
git status  # See what changed
git diff   # Review changes
git checkout Recordanwser.tsx  # Revert one file
```

### Option 3: Start Fresh
```bash
git checkout -- app/
git checkout -- components/
npm run dev
```

---

## 📖 Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Hooks:** https://react.dev/reference/react
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs

---

**Still having issues? Check the main documentation files or create an issue with:**
- Error message (from console)
- Steps to reproduce
- What you expected to happen
- What actually happened

