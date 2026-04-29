# 🎯 Quick Setup Guide - Assignment Detector

Follow these steps to get the Assignment Detector running on your machine.

---

## ⚙️ Prerequisites Checklist

Before you start, ensure you have:

- [ ] **Node.js** installed (v14 or higher) → https://nodejs.org/
- [ ] **MySQL** installed → https://dev.mysql.com/downloads/mysql/
- [ ] **Git** installed (optional) → https://git-scm.com/
- [ ] **Visual Studio Code** or any text editor (optional but recommended)
- [ ] A working internet connection

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MySQL version
mysql --version
```

---

## 📥 Step 1: Download/Clone the Project

### Option A: If you have Git
```bash
cd Desktop
git clone <repository-url>
cd assignment-detector
```

### Option B: Manual Download
1. Download the project folder
2. Extract it to your Desktop
3. Open terminal/command prompt in the folder

---

## 🗄️ Step 2: Setup MySQL

### For Windows Users:

**2.1 Verify MySQL Service is Running**
- Open Task Manager (Ctrl + Shift + Esc)
- Look for "MySQL80" or similar service running
- If not running, restart MySQL:
  ```bash
  # Admin Command Prompt
  net start MySQL80
  ```

**2.2 Test MySQL Connection**
```bash
# Connect to MySQL
mysql -u root -p

# You'll be prompted for password - enter your MySQL root password
# If successful, you'll see: mysql>
# Type: exit
```

**2.3 Create/Verify Database**
The application will auto-create the database, but you can verify in MySQL Workbench:
1. Open MySQL Workbench
2. Double-click "Local instance MySQL80"
3. Enter your password
4. You should see the connection successful

---

## 📦 Step 3: Install Project Dependencies

```bash
# Navigate to project folder (if not already there)
cd assignment-detector

# Install all dependencies from package.json
npm install

# This will take 2-3 minutes...
# Watch for "added X packages" message at the end
```

**Troubleshooting:**
- If you see errors about Python or build tools, install Visual Studio Build Tools
- If npm fails, try: `npm install --legacy-peer-deps`

---

## 🔑 Step 4: Configure Environment Variables

**4.1 Check if `.env` file exists**
```bash
# Windows Command Prompt
dir | find ".env"

# Or look in file explorer: Look for .env file
```

**4.2 Edit `.env` file**
- Open `.env` in your text editor
- Update with your MySQL password:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password_here
DB_NAME=assignment_db
JWT_SECRET=super_secret_assignment_key_123
PORT=3000
```

**IMPORTANT:** Replace `your_mysql_root_password_here` with your actual MySQL root password set during MySQL installation.

**Example:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Admin@123
DB_NAME=assignment_db
JWT_SECRET=super_secret_assignment_key_123
PORT=3000
```

---

## 🚀 Step 5: Start the Server

**5.1 Open Command Prompt/Terminal**
```bash
# Navigate to project folder (if not already there)
cd C:\Users\YourUsername\Desktop\assignment-detector
```

**5.2 Start the application**
```bash
npm start
```

**5.3 Expected Output**
You should see something like:
```
Database initialized/checked successfully.
Tables initialized/checked successfully.
Server is running on http://localhost:3000
```

**If you see errors:**
- Check MySQL is running
- Verify `.env` file has correct password
- Check if port 3000 is already in use

---

## 🌐 Step 6: Access the Application

1. Open your web browser (Chrome, Firefox, Edge, Safari)
2. Go to: `http://localhost:3000`
3. You should see the Assignment Detector landing page

---

## 👥 Step 7: Create and Test Account

### Register New Account
1. Click "Register" button
2. Enter:
   - **Username:** `testuser`
   - **Password:** `password123`
   - **Confirm Password:** `password123`
3. Click "Create Account"
4. You'll be redirected to login page

### Login
1. Enter your credentials:
   - **Username:** `testuser`
   - **Password:** `password123`
2. Click "Sign In"
3. You're now on the Dashboard!

---

## 📤 Step 8: Test Assignment Upload

### Create a Test PDF
1. Open any text editor (Notepad, Word, etc.)
2. Write some text
3. Save as `test_assignment.pdf`

### Upload Assignment
1. On Dashboard, click "Submit Assignment"
2. Click or drag-drop your PDF
3. Click "🚀 Submit Assignment"
4. You should see: ✅ "Assignment submitted successfully!"

### Test Duplicate Detection
1. Upload the **same PDF again**
2. You should see: ⚠️ "You are trying to submit a duplicate assignment" with similarity %

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts without errors
- [ ] Can access `http://localhost:3000`
- [ ] Can register a new account
- [ ] Can login with the account
- [ ] Can upload a PDF assignment
- [ ] Can see assignment in "Your Submissions" list
- [ ] Can see "Your Submissions" table
- [ ] Uploading duplicate shows warning
- [ ] Can logout and log back in

---

## 🆘 Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
1. Start MySQL service (Windows):
   ```bash
   net start MySQL80
   ```

2. Verify credentials in `.env`:
   ```bash
   mysql -u root -p your_password
   ```

3. If failed, reset MySQL password:
   - Google: "Reset MySQL root password Windows"

### Problem: "Port 3000 already in use"

**Solution:**
Option A: Close the other application using port 3000
Option B: Change port in `.env`:
```env
PORT=3001
```

### Problem: "Cannot extract text from PDF"

**Solution:**
- Try a different PDF file
- Ensure PDF has actual text (not just images)
- Try opening the PDF in your PDF reader first

### Problem: "Module not found errors"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

### Problem: "npm: command not found"

**Solution:**
- Node.js might not be installed correctly
- Reinstall Node.js from https://nodejs.org/
- Restart your computer after installation
- Reopen command prompt

---

## 📞 Getting Help

1. **Check the main README.md** for detailed documentation
2. **Check browser console** (F12 → Console tab) for errors
3. **Verify `.env` file** has correct MySQL password
4. **Check if MySQL is running** (Task Manager → Services)
5. **Check if port 3000 is available** (no other app using it)

---

## 🎉 Next Steps

After successful setup:
- Read [README.md](./README.md) for complete documentation
- Explore the API documentation in README
- Try uploading various PDFs
- Understand how duplicate detection works
- Check the database in MySQL Workbench

---

## 📝 Useful Commands

```bash
# Start server
npm start

# Stop server
Ctrl + C

# View database in MySQL Workbench
# Host: localhost
# User: root
# Password: (your MySQL password)
# Database: assignment_db

# Check if MySQL is running (Windows)
tasklist | findstr mysql

# Stop MySQL service (Windows Admin)
net stop MySQL80

# Start MySQL service (Windows Admin)
net start MySQL80
```

---

**Everything set up? Happy detecting! 🎯**
