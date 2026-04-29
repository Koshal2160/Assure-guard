# 🧪 Testing Guide - Assignment Detector

Complete testing scenarios to verify your Assignment Detector installation and functionality.

---

## Pre-Testing Checklist

Before running tests, ensure:
- [ ] Server is running (`npm start`)
- [ ] MySQL is running and connected
- [ ] You can access `http://localhost:3000`
- [ ] `.env` file is properly configured

---

## 📋 Test 1: User Registration

### Objective
Verify user registration system works correctly.

### Steps
1. Navigate to `http://localhost:3000`
2. Click "Register"
3. Enter details:
   - **Username:** `student_john`
   - **Password:** `Password123!`
   - **Confirm Password:** `Password123!`
4. Click "Create Account"

### Expected Results
✅ Success message appears
✅ Redirected to login page
✅ Can login with new credentials

### Troubleshooting
❌ "Username already taken" → Try different username
❌ "Passwords do not match" → Ensure both passwords are identical
❌ Connection error → Check server is running

---

## 📋 Test 2: User Login/Logout

### Objective
Verify authentication tokens work correctly.

### Steps
1. On login page, enter credentials from Test 1
2. Click "Sign In"
3. Verify Dashboard loads
4. Click "Logout" button
5. Verify redirected to login page

### Expected Results
✅ Login successful, redirected to dashboard
✅ JWT token stored in browser (localStorage)
✅ User data displayed on dashboard
✅ Logout clears token and redirects

### Troubleshooting
❌ "Invalid credentials" → Check username/password
❌ Page stuck on loading → Check network tab in browser console
❌ Token error → Try clearing localStorage: `localStorage.clear()`

---

## 📋 Test 3: PDF Upload - First Submission

### Objective
Test initial PDF upload and storage.

### Prerequisites
Have a simple text-based PDF ready. Create one:
1. Open Notepad
2. Type:
   ```
   Assignment 1
   
   Title: Introduction to Data Structures
   
   Question 1: Explain arrays vs linked lists.
   
   Arrays provide contiguous memory allocation with O(1) access time.
   Linked lists use dynamic allocation with O(n) access time.
   ```
3. Save as `assignment_1.pdf`

### Steps
1. Login to dashboard
2. Click upload area or browse for `assignment_1.pdf`
3. File should show in "File selected" section
4. Click "🚀 Submit Assignment"
5. Wait for processing

### Expected Results
✅ File is accepted
✅ Success message: "Assignment submitted successfully!"
✅ No duplicate warning
✅ Assignment appears in "Your Submissions" table
✅ Timestamp shows current date/time

### Troubleshooting
❌ "Could not extract text from PDF" → Create new PDF with text content
❌ File not selected → Ensure file is valid PDF format
❌ Spinner keeps spinning → Check server console for errors

---

## 📋 Test 4: PDF Upload - Duplicate Detection

### Objective
Verify duplicate detection works correctly.

### Prerequisites
- Completed Test 3 successfully
- Same PDF file from Test 3 ready

### Steps
1. Logged in as student_john
2. Try uploading the **exact same PDF** from Test 3
3. Click "🚀 Submit Assignment"

### Expected Results
✅ Duplicate warning appears: "You are trying to submit a duplicate assignment"
✅ Shows similarity percentage (should be ~100% or very high)
✅ Assignment is NOT added to submission list
✅ Shows "Submitted by: User ID: X"

### Troubleshooting
❌ Duplicate not detected → Similarity might be below 75% threshold
❌ False positive → Lower SIMILARITY_THRESHOLD in assignment.js
❌ Error during check → Check server console

---

## 📋 Test 5: Partial Duplicate Detection

### Objective
Test detection with modified versions of same assignment.

### Prerequisites
- Have original assignment from Test 3

### Steps
1. Create a NEW PDF with modified content:
   ```
   Assignment Analysis
   
   Title: Data Structure Comparison
   
   Question 1: Compare arrays and linked lists.
   
   Arrays offer contiguous storage with O(1) lookup.
   Linked lists use dynamic allocation with linear access.
   ```

2. Upload this new PDF

### Expected Results
⚠️ Behavior depends on similarity score:
- **If similarity > 75%:** Duplicate warning (acceptable duplicate)
- **If similarity ≤ 75%:** Assignment accepted (acceptable variation)

### Interpretation
- Both assignments should be detected as similar but this shows the threshold in action
- Small changes in wording/structure reduce similarity score

---

## 📋 Test 6: Unique Assignment Upload

### Objective
Verify completely different assignments are accepted.

### Prerequisites
None special

### Steps
1. Create a NEW PDF on completely different topic:
   ```
   Assignment 2
   
   Title: Database Management Systems
   
   Question: What is normalization in databases?
   
   Normalization is the process of organizing data to reduce redundancy
   and improve data integrity. There are multiple normal forms...
   ```

2. Save as `assignment_2.pdf`
3. Upload this new PDF

### Expected Results
✅ Assignment accepted immediately
✅ Success message appears
✅ Shows in submission list
✅ No duplicate warning
✅ Similarity shown as low percentage

---

## 📋 Test 7: Multiple User Registration

### Objective
Verify different users can have separate assignments.

### Prerequisites
None

### Steps
1. **Register second user:**
   - Username: `student_jane`
   - Password: `Password456!`

2. **Login as student_jane**

3. **Upload first assignment:**
   - Create new PDF with content
   - Upload it
   - Verify success

4. **Login as student_john** (first user)

5. **Try uploading same PDF** (modified)

### Expected Results
✅ Both users can register independently
✅ Each user has separate submission history
✅ Duplicate detection works across users
✅ Each user can only see their own submissions

---

## 📋 Test 8: View Submission History

### Objective
Verify submission list and history display.

### Prerequisites
- Have 2-3 successful submissions

### Steps
1. Login to account with multiple submissions
2. Scroll to "Your Submissions" section
3. Verify all submissions listed
4. Check columns: #, Filename, Submitted On, Status

### Expected Results
✅ All submissions shown in table
✅ Most recent submissions listed first
✅ Filenames match uploaded PDFs
✅ Timestamps show correct date/time
✅ All show status "✓ Accepted"

---

## 📋 Test 9: Database Verification

### Objective
Verify data is correctly stored in MySQL.

### Prerequisites
- Have completed several uploads

### Steps
1. Open MySQL Workbench
2. Connect to localhost (root)
3. Select database: `assignment_db`
4. Run query:
   ```sql
   SELECT * FROM users;
   SELECT COUNT(*) as total_assignments FROM assignments;
   SELECT * FROM assignments ORDER BY created_at DESC LIMIT 5;
   ```

### Expected Results
✅ Can see registered users in `users` table
✅ Assignment count matches your submissions
✅ Recently submitted assignments appear in results
✅ No NULL values in important fields

---

## 📋 Test 10: Error Handling

### Objective
Verify error handling works correctly.

### Test Case A: Invalid PDF
**Steps:**
1. Create a text file named `fake.pdf`
2. Add random text, save as `.pdf` (not real PDF)
3. Try uploading

**Expected:** Error message about invalid PDF

### Test Case B: Empty PDF
**Steps:**
1. Create empty PDF file
2. Try uploading

**Expected:** Error about extracting text

### Test Case C: No File Selected
**Steps:**
1. Click "Submit" without selecting file
2. Button should remain disabled

**Expected:** Submit button doesn't respond

### Test Case D: Wrong Credentials
**Steps:**
1. Login with wrong password
2. Try multiple wrong attempts

**Expected:** "Invalid credentials" error each time

---

## 🔬 Advanced Testing

### API Testing with cURL/Postman

**Register via API:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"api_user","password":"test123"}'
```

**Login via API:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"api_user","password":"test123"}'
```

**Get Assignments List:**
```bash
curl -X GET http://localhost:3000/api/assignments/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Performance Testing

### Test Concurrent Uploads
1. Create 5 different PDF files
2. Upload them rapidly (5-10 seconds apart)
3. Verify all are processed correctly
4. Check database for all entries

### Test Large Files
1. Create PDF file ~5MB
2. Upload and verify it's handled correctly
3. Check timeout doesn't occur

---

## 🐛 Known Issues & Solutions

### Issue: Duplicate not detected when expected
**Solution:** 
- Check similarity threshold (currently 75%)
- View similarity score in response
- Adjust threshold in `assignment.js` if needed

### Issue: Upload stuck at spinner
**Solution:**
- Check browser console (F12)
- Check server console
- Verify file is valid PDF
- Check file size < 10MB

### Issue: Database not updating
**Solution:**
- Verify MySQL is running
- Check `.env` credentials
- Restart server
- Verify connection in MySQL Workbench

---

## ✅ Final Verification Checklist

After all tests, verify:
- [ ] Registration works
- [ ] Login/Logout works
- [ ] PDF upload successful
- [ ] Duplicate detection works
- [ ] Submission history displays
- [ ] Database has correct data
- [ ] Multiple users work independently
- [ ] Error handling works
- [ ] No console errors
- [ ] All timestamps are correct

---

## 📝 Test Report Template

```
Test Date: ________________
Tester: ___________________

Test Results:
□ Registration: PASS / FAIL
□ Login: PASS / FAIL
□ Upload: PASS / FAIL
□ Duplicate Detection: PASS / FAIL
□ History: PASS / FAIL
□ Database: PASS / FAIL

Issues Found:
_____________________________________
_____________________________________

Notes:
_____________________________________
_____________________________________
```

---

## 🎯 Next Steps After Testing

1. **Record any issues** found during testing
2. **Review the README.md** for full documentation
3. **Explore API endpoints** with Postman or similar tool
4. **Check database** in MySQL Workbench
5. **Review code** to understand implementation
6. **Deploy** if everything works correctly

---

**Happy Testing! 🚀**
