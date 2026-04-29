# 🎯 Assignment Detector - Quick Start

Your complete Assignment Duplicate Detection system is ready!

---

## 📦 What's Included

Your project now has:

### ✅ Complete Backend
- Node.js/Express server with MySQL database
- User authentication (Register/Login with JWT)
- PDF parsing and duplicate detection
- Advanced similarity algorithms (Jaccard, Cosine, LCS)
- RESTful API endpoints
- Error handling and logging

### ✅ Complete Frontend
- Modern, responsive web interface
- Drag-and-drop PDF upload
- Real-time duplicate detection
- Submission history tracking
- User authentication flows

### ✅ Database
- MySQL schema with users and assignments tables
- Foreign key relationships
- Indexes for performance
- Automatic table creation

### ✅ Documentation
- `README.md` - Complete project documentation
- `SETUP_GUIDE.md` - Step-by-step installation
- `TESTING_GUIDE.md` - Testing procedures
- `DATABASE_SCHEMA.md` - Database reference

---

## 🚀 Getting Started (5 minutes)

### 1. Install Dependencies
```bash
cd C:\Users\YourUsername\Desktop\assignment-detector
npm install
```

### 2. Configure Database
Edit `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=assignment_db
JWT_SECRET=super_secret_assignment_key_123
PORT=3000
```

### 3. Start Server
```bash
npm start
```

### 4. Access Application
Open browser: `http://localhost:3000`

---

## 👥 First Time Usage

1. **Register Account**
   - Click "Register"
   - Enter username and password
   - Click "Create Account"

2. **Login**
   - Enter your credentials
   - Click "Sign In"

3. **Upload Assignment**
   - Click upload area
   - Select PDF file
   - Click "Submit Assignment"

4. **Check Results**
   - ✅ Success = Assignment saved
   - ⚠️ Duplicate = Already submitted

---

## 📁 Project Structure

```
assignment-detector/
├── client/              # Frontend (HTML/CSS/JS)
│   ├── index.html      # Landing page
│   ├── login.html      # Login page
│   ├── register.html   # Registration page
│   ├── dashboard.html  # Main dashboard
│   └── style.css       # All styles
│
├── server/             # Backend (Node.js)
│   ├── app.js          # Server setup
│   ├── db.js           # Database connection
│   ├── routes/
│   │   ├── auth.js     # Authentication
│   │   └── assignment.js
│   └── utils/
│       ├── hash.js     # Password hashing
│       └── similarity.js
│
├── .env                # Configuration
├── package.json        # Dependencies
├── README.md           # Full documentation
├── SETUP_GUIDE.md      # Installation guide
├── TESTING_GUIDE.md    # Testing procedures
└── DATABASE_SCHEMA.md  # Database reference
```

---

## 🔧 Key Features Explained

### 1. Advanced Duplicate Detection
Uses 3 algorithms:
- **Jaccard Similarity** (40%) - Word overlap
- **Cosine Similarity** (40%) - Semantic similarity  
- **LCS Ratio** (20%) - Exact text matching

**Result:** 75% threshold for flagging duplicates

### 2. User Isolation
- Each user has separate assignments
- Can't see other users' submissions
- Password protected with bcrypt hashing

### 3. PDF Processing
- Automatic text extraction from PDF
- Handles multi-page documents
- Cleans text for accurate comparison

### 4. Real-Time Feedback
- Instant duplicate detection
- Shows similarity percentage
- Displays submission history

---

## 🎓 Example Workflows

### Workflow 1: First Submission (Success)
1. Register → Login → Dashboard
2. Upload `assignment_1.pdf`
3. ✅ "Assignment submitted successfully!"
4. PDF saved in database

### Workflow 2: Duplicate Attempt (Blocked)
1. Upload `assignment_1.pdf` again
2. ⚠️ "You are trying to submit a duplicate assignment (100%)"
3. Assignment rejected - NOT saved

### Workflow 3: Modified Content (Partial Match)
1. Upload modified version of assignment
2. If similarity > 75% → ⚠️ Duplicate warning
3. If similarity ≤ 75% → ✅ Accepted

---

## 📊 Database Info

**Auto-Created Tables:**
- `users` - Student accounts
- `assignments` - Submitted work

**Auto-Created Indexes:**
- `idx_user_id` - Fast user lookups
- `idx_created_at` - Fast date sorting

**Auto-Initialized Data:**
- Database: `assignment_db`
- Ready to accept submissions immediately

---

## 🔐 Security Features

✅ **Passwords:** Bcrypt hashing (10 rounds)
✅ **Authentication:** JWT tokens (24 hour expiry)
✅ **Database:** Parameterized queries (SQL injection safe)
✅ **API:** CORS protected
✅ **Files:** Validated PDF format only

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check MySQL is running
# Check .env has correct password
# Check port 3000 is available
```

### Login fails
```bash
# Verify username/password match registration
# Check user exists in database
# Try clearing localStorage
```

### PDF upload fails
```bash
# Ensure PDF is valid (not corrupted)
# Check file < 10MB
# Try with text-based PDF
```

### Duplicate not detected
```bash
# Check similarity score (should show %)
# Threshold is 75% - adjust if needed
# Ensure text extracted successfully
```

---

## 📚 Documentation Files

### For Installation
→ Read: **SETUP_GUIDE.md**
- Step-by-step MySQL setup
- Node.js installation
- Configuration guide
- Troubleshooting

### For Usage
→ Read: **README.md**
- Project overview
- User guide
- API documentation
- Feature explanations

### For Testing
→ Read: **TESTING_GUIDE.md**
- Test cases
- Verification steps
- Expected results
- Advanced testing

### For Database
→ Read: **DATABASE_SCHEMA.md**
- Table structures
- Query examples
- Backup procedures
- Maintenance

---

## 🚀 Next Steps

After setup works:

1. **Explore the Code**
   - Read `server/app.js` to understand server
   - Check `server/utils/similarity.js` for algorithm
   - Review `client/dashboard.html` for frontend

2. **Test Everything**
   - Follow TESTING_GUIDE.md
   - Verify duplicate detection
   - Check database records

3. **Customize (Optional)**
   - Change similarity threshold (75% → ?)
   - Add more algorithms
   - Modify UI styling
   - Add admin dashboard

4. **Deploy (If Ready)**
   - Use cloud hosting (AWS, Azure, etc.)
   - Set strong JWT_SECRET
   - Use managed MySQL (RDS, Azure Database)
   - Enable HTTPS/SSL

---

## 📊 File Modifications Made

The following files have been created/updated:

### Updated Files
- ✅ `server/db.js` - Enhanced error handling
- ✅ `server/app.js` - Added logging and error middleware
- ✅ `server/routes/assignment.js` - Better error handling
- ✅ `server/utils/similarity.js` - Advanced algorithms
- ✅ `README.md` - Comprehensive documentation

### New Files
- 📄 `SETUP_GUIDE.md` - Installation guide
- 📄 `TESTING_GUIDE.md` - Testing procedures
- 📄 `DATABASE_SCHEMA.md` - Database reference

---

## 💡 Pro Tips

1. **Keep `.env` secure** - Never commit to git
2. **Test with real PDFs** - Not image scans
3. **Monitor similarity scores** - Adjust threshold as needed
4. **Regular backups** - Backup database regularly
5. **Check server logs** - Look for errors/warnings

---

## ✨ Feature Highlights

🎯 **Advanced Detection:** Multiple similarity algorithms
🔒 **Secure:** Password hashing + JWT authentication
📄 **PDF Handling:** Automatic text extraction
📊 **Database:** MySQL with automatic schema creation
🎨 **UI:** Modern, responsive design
📱 **Mobile:** Works on phone/tablet browsers
⚡ **Performance:** Optimized queries with indexes
🔍 **History:** View all previous submissions

---

## 📞 Support Resources

1. **Server won't run?**
   → Check SETUP_GUIDE.md troubleshooting

2. **Database connection error?**
   → Verify MySQL credentials in .env

3. **Upload not working?**
   → Check browser console (F12) for errors

4. **Need to debug?**
   → Check server console for error logs

5. **Want to understand code?**
   → Start with README.md architecture section

---

## 🎯 Success Checklist

- [ ] MySQL installed and running
- [ ] `.env` configured with credentials
- [ ] `npm install` completed successfully
- [ ] Server starts with `npm start`
- [ ] Can access `http://localhost:3000`
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can upload PDF assignment
- [ ] Can see duplicate detection working
- [ ] Can see submission in history

---

## 🎉 You're All Set!

Your Assignment Duplicate Detector is fully functional and ready to use.

**Start the server:**
```bash
npm start
```

**Open in browser:**
```
http://localhost:3000
```

**Register and test:**
- Create account
- Upload PDF
- See duplicate detection in action

---

**Enjoy your project! 🚀**

For detailed information, refer to the comprehensive documentation in the project folder.
