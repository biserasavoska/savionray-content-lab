# Draft Visibility and Submission Workflow - Testing Guide

## 🧪 **Testing the Implementation**

After restarting your development server (`npm run dev`), follow these steps to test the draft visibility and submission workflow fixes:

---

## **Test 1: Creative/Admin User - Draft Creation and Submission**

### **Steps:**
1. **Login as Creative or Admin user**
2. **Navigate to Content Creation page** (`/content-review` or create new content)
3. **Create a new draft:**
   - Fill in content details
   - Click **"Save Draft"** button
   - Verify status shows as **"Draft"** (yellow badge)

4. **Submit for Review:**
   - Click **"Submit for Review"** button
   - Verify status changes to **"Awaiting Feedback"** (blue badge)

### **Expected Results:**
- ✅ Creative/Admin can see "Draft" option in status dropdown
- ✅ "Save Draft" button saves content with DRAFT status
- ✅ "Submit for Review" button changes status to AWAITING_FEEDBACK
- ✅ Both buttons work without errors

---

## **Test 2: Client User - Draft Visibility**

### **Steps:**
1. **Login as Client user** (or switch user role to CLIENT)
2. **Navigate to Content Review page** (`/content-review`)
3. **Check status dropdown filter:**
   - Look for status filter dropdown
   - Verify **"Draft" option is NOT visible**

4. **Check content list:**
   - Verify only content with status `AWAITING_FEEDBACK`, `APPROVED`, `REJECTED` is visible
   - No content with `DRAFT` status should appear

### **Expected Results:**
- ✅ Client users cannot see "Draft" option in dropdown
- ✅ Client users cannot see any content with DRAFT status
- ✅ Only submitted content (AWAITING_FEEDBACK+) is visible

---

## **Test 3: API Endpoint Testing**

### **Test Content Drafts API:**
1. **Open browser developer tools**
2. **Navigate to Network tab**
3. **As Creative/Admin user:**
   - Go to `/content-review`
   - Check API call to `/api/content-drafts`
   - Verify response includes content with `DRAFT` status

4. **As Client user:**
   - Go to `/content-review`
   - Check API call to `/api/content-drafts`
   - Verify response excludes content with `DRAFT` status

### **Expected Results:**
- ✅ Creative/Admin API calls include DRAFT status content
- ✅ Client API calls exclude DRAFT status content
- ✅ Role-based filtering works correctly

---

## **Test 4: Complete Workflow**

### **Steps:**
1. **As Creative user:**
   - Create new content
   - Save as draft (status: DRAFT)
   - Submit for review (status: AWAITING_FEEDBACK)

2. **As Client user:**
   - Navigate to content review page
   - Verify you can see the submitted content
   - Approve or reject the content

3. **As Creative user:**
   - Check that status updated correctly
   - Verify workflow progression

### **Expected Results:**
- ✅ Draft → Awaiting Feedback → Approved/Rejected workflow works
- ✅ Client can only see submitted content
- ✅ Status transitions work correctly

---

## **Test 5: Edge Cases**

### **Test Submit API Directly:**
1. **Create a draft as Creative user**
2. **Open browser developer tools**
3. **Test submit API call:**
   ```javascript
   fetch('/api/drafts/[DRAFT_ID]/submit', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' }
   })
   ```
4. **Verify response shows status as 'AWAITING_FEEDBACK'**

### **Test Permission Errors:**
1. **Try to access submit API as Client user**
2. **Verify 403 Forbidden error**

### **Expected Results:**
- ✅ Submit API correctly sets status to AWAITING_FEEDBACK
- ✅ Permission checks work correctly
- ✅ Error handling works as expected

---

## **🔍 Debugging Tips**

### **If Changes Don't Appear:**
1. **Hard refresh browser** (Ctrl+F5 or Cmd+Shift+R)
2. **Clear browser cache**
3. **Check browser console for errors**
4. **Verify development server restarted**

### **Check API Responses:**
1. **Open Network tab in developer tools**
2. **Look for API calls to `/api/content-drafts`**
3. **Check response data includes/excludes DRAFT status based on user role**

### **Verify User Roles:**
1. **Check user role in database or session**
2. **Ensure you're testing with correct user types**
3. **Verify role-based logic is working**

---

## **✅ Success Criteria**

The implementation is working correctly if:

- [ ] Creative/Admin users can see and create drafts
- [ ] Creative/Admin users can submit drafts for review
- [ ] Client users cannot see "Draft" option in dropdowns
- [ ] Client users cannot see content with DRAFT status
- [ ] Submit API correctly sets status to AWAITING_FEEDBACK
- [ ] Role-based filtering works in all API endpoints
- [ ] Complete workflow functions end-to-end

---

## **🚨 Common Issues**

### **Issue: Changes not visible**
**Solution:** Restart development server and hard refresh browser

### **Issue: API errors**
**Solution:** Check browser console and server logs for error details

### **Issue: User role not working**
**Solution:** Verify user role in database and session management

### **Issue: Dropdown still shows Draft**
**Solution:** Check if `isClientUser` prop is correctly passed to components

---

## **📞 Need Help?**

If you encounter any issues during testing:
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify user roles and permissions
4. Test API endpoints directly using browser developer tools
