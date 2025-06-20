# 🧪 Team Testing Guide - SavionRay Content Lab

## 🚀 Application URL
**Production URL**: https://savionray-content-lab-production.up.railway.app/

## 👥 Test User Accounts

### Default Test Users (Pre-configured)
These users are automatically created when you first access the application:

| Email | Role | Description |
|-------|------|-------------|
| `creative@savionray.com` | Creative | Content creator with full access to content generation |
| `client@savionray.com` | Client | Client who can review and approve content |
| `admin@savionray.com` | Admin | Full administrative access |

**Password**: Any password will work for these test accounts

### Creating Additional Test Users
1. **Login as any existing user**
2. **Use any email** - the system will automatically create a new user
3. **Role assignment**:
   - `@savionray.com` emails → Client role
   - All other emails → Creative role

## 🎯 Testing Scenarios

### 1. User Authentication & Roles
- [ ] **Login with test accounts**
- [ ] **Verify role-based access** (Creative vs Client vs Admin)
- [ ] **Test new user creation** with different email domains
- [ ] **Verify session persistence**

### 2. Content Idea Management
- [ ] **Create new content ideas**
- [ ] **Edit existing ideas**
- [ ] **Add descriptions and context**
- [ ] **Test idea status updates**
- [ ] **Verify idea listing and filtering**

### 3. AI Content Generation
- [ ] **Generate text content** using different models
- [ ] **Test various content formats** (LinkedIn, Twitter, Instagram, Facebook)
- [ ] **Verify content quality** and relevance
- [ ] **Test different tones** and target audiences
- [ ] **Check for proper formatting** (hashtags, call-to-action)

### 4. Visual Draft Generation
- [ ] **Generate visual drafts** for content ideas
- [ ] **Test different visual styles** and prompts
- [ ] **Verify image quality** and relevance
- [ ] **Test image download** functionality

### 5. Approval Workflow
- [ ] **Submit content for approval** (Creative role)
- [ ] **Review submitted content** (Client role)
- [ ] **Approve/reject content**
- [ ] **Test feedback system**
- [ ] **Verify status updates**

### 6. Content Management
- [ ] **View ready content** list
- [ ] **Edit generated content**
- [ ] **Test content organization**
- [ ] **Verify content search** and filtering

### 7. Delivery Plans
- [ ] **Create delivery plans**
- [ ] **Assign content to plans**
- [ ] **Set target months**
- [ ] **View plan overview**

## 🐛 Known Issues & Workarounds

### Current Issues Being Fixed:
1. **OpenAI API Model Configuration** - Fixed in latest deployment
2. **NextAuth JWT Decryption** - Requires NEXTAUTH_SECRET update in Railway
3. **Environment Variables** - Some may need updating in Railway dashboard

### Temporary Workarounds:
- If content generation fails, try refreshing the page
- If login issues occur, clear browser cache and cookies
- If visual generation fails, try again after a few seconds

## 📊 Testing Checklist

### Functional Testing
- [ ] **User Registration/Login** works correctly
- [ ] **Role-based permissions** are enforced
- [ ] **Content creation** generates appropriate content
- [ ] **Visual generation** produces relevant images
- [ ] **Approval workflow** functions properly
- [ ] **Content editing** saves changes correctly
- [ ] **Search and filtering** work as expected

### Performance Testing
- [ ] **Page load times** are reasonable (< 3 seconds)
- [ ] **Content generation** completes within 30 seconds
- [ ] **Visual generation** completes within 60 seconds
- [ ] **Database operations** are responsive

### User Experience Testing
- [ ] **Navigation** is intuitive
- [ ] **Error messages** are clear and helpful
- [ ] **Loading states** are visible
- [ ] **Mobile responsiveness** works on different screen sizes
- [ ] **Accessibility** features work (if applicable)

## 🚨 Reporting Issues

### When Reporting Bugs:
1. **Include the exact steps** to reproduce the issue
2. **Specify your user role** (Creative/Client/Admin)
3. **Include browser information** (Chrome, Firefox, Safari, etc.)
4. **Add screenshots** if relevant
5. **Note the time** when the issue occurred

### Issue Categories:
- **Critical**: Application crashes, login failures, data loss
- **High**: Core functionality broken, content generation fails
- **Medium**: UI issues, performance problems
- **Low**: Cosmetic issues, minor UX improvements

## 📈 Success Metrics

### For Team Testing:
- **100% of core features** are functional
- **No critical bugs** blocking user workflows
- **Performance is acceptable** for all operations
- **User experience is intuitive** for new users

### For Production Readiness:
- **All test scenarios** pass successfully
- **Performance benchmarks** are met
- **Security measures** are in place
- **Error handling** is robust

## 🔧 Technical Support

### If You Encounter Issues:
1. **Check the browser console** for error messages
2. **Try a different browser** to isolate the issue
3. **Clear browser cache** and cookies
4. **Report the issue** with detailed information

### Contact Information:
- **Technical Issues**: Report through your team's designated channel
- **Feature Requests**: Document in your team's feedback system
- **Urgent Issues**: Contact the development team directly

## 🎉 Testing Completion

### When Testing is Complete:
1. **All test scenarios** have been executed
2. **Issues have been documented** and reported
3. **Performance has been verified** as acceptable
4. **User experience has been validated** as intuitive

### Sign-off Checklist:
- [ ] **Functional testing** completed
- [ ] **Performance testing** completed
- [ ] **User experience testing** completed
- [ ] **All critical issues** resolved
- [ ] **Team feedback** collected and documented

---

**Happy Testing! 🚀**

Your feedback is crucial for making SavionRay Content Lab the best content management platform for your team. 