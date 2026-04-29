# 📋 Assure-guard

A web-based DBMS application that detects and flags duplicate PDF assignments. Built with Node.js, Express, MySQL, and a modern web frontend.

## 🎯 Project Overview

**Assure-guard** is designed for educational institutions to prevent plagiarism and academic dishonesty by automatically comparing student submissions against previously submitted assignments. When a student uploads a PDF, the system extracts text and compares it with all previous submissions using advanced similarity algorithms.

### Key Features

✅ **User Authentication** - Secure registration and login with JWT tokens and bcrypt password hashing
✅ **PDF Upload & Processing** - Students upload PDF assignments; text is automatically extracted
✅ **Advanced Duplicate Detection** - Uses multiple similarity algorithms (Jaccard, Cosine, LCS)
✅ **Real-Time Similarity Scoring** - Shows exact percentage match with previous submissions
✅ **Submission History** - Users can view all their previous submissions
✅ **Database Tracking** - All submissions stored in MySQL for audit trails
✅ **Responsive UI** - Modern, intuitive dashboard with drag-and-drop file upload
✅ **Different Users** - Per-user submissions with privacy controls

---

## 📋 System Requirements

- **Node.js** v14 or higher
- **MySQL** v5.7 or higher (or MySQL Workbench)
- **npm** package manager
- **Modern web browser** (Chrome, Firefox, Edge, Safari)

---

## 🚀 Installation Guide

### Step 1: Install MySQL and Create Database

1. **Download and Install MySQL Community Server**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Follow the installation wizard
   - Set root password (remember this!)
   - Configure MySQL as a service

2. **Open MySQL Command Line or MySQL Workbench**
   ```sql
   -- The database and tables will be created automatically by the app
   -- But you can verify connection in MySQL Workbench
   ```

3. **Test Connection in MySQL Workbench**
   - Open MySQL Workbench
   - Create new connection: `localhost`, user: `root`
   - Test Connection to verify setup

### Step 2: Clone and Setup Project

```bash
cd /path/to/assignment-detector

# Install dependencies
npm install
```

### Step 3: Configure Environment Variables

Create/Update `.env` file in the root directory:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=assignment_db

# JWT Secret (change to a strong secret)
JWT_SECRET=super_secret_assignment_key_123

# Server Port
PORT=3000
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL root password.

### Step 4: Verify Database Setup

The application automatically creates the database and tables on first run. The database schema includes:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🏃 How to Run

### Start the Server

```bash
# From the project root directory
npm start
```

You should see:
```
Database initialized/checked successfully.
Tables initialized/checked successfully.
Server is running on http://localhost:3000
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You'll see the landing page with options to Register or Login.

---

## 👥 User Guide

### 1. Register New Account
- Click "Register" on the homepage
- Enter username and password (min 6 characters)
- Confirm password matches
- Account is created instantly

### 2. Login
- Enter your username and password
- Click "Sign In"
- You'll be redirected to the Dashboard

### 3. Submit Assignment
1. On the Dashboard, navigate to "Submit Assignment" section
2. **Option A:** Click the upload area to browse your PDF
3. **Option B:** Drag and drop your PDF onto the upload area
4. Selected file will be displayed below
5. Click "🚀 Submit Assignment" button
6. Wait for the system to analyze

### 4. Check Results

**✅ Success Message:** "Assignment submitted successfully! No duplicate found."
- Your assignment is accepted and stored

**⚠️ Duplicate Warning:** "You are trying to submit a duplicate assignment. (Similarity: X%)"
- Shows the percentage match with a previous submission
- Assignment is NOT stored

### 5. View Submission History
- All accepted submissions appear in the "Your Submissions" table
- Shows: Filename, Date/Time, Status
- Sorted by most recent first

---

## 🔧 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
    "username": "john_doe",
    "password": "securepass123"
}

Response (201):
{
    "message": "User registered successfully"
}

Error (400):
{
    "error": "Username already taken"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "john_doe",
    "password": "securepass123"
}

Response (200):
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Error (401):
{
    "error": "Invalid credentials"
}
```

### Assignment Endpoints

#### Submit Assignment
```
POST /api/assignments/submit
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data

Form Data:
- assignment: <PDF File>

Response (201):
{
    "message": "Assignment submitted successfully!"
}

Error (409 - Duplicate):
{
    "error": "You are trying to submit a duplicate assignment.",
    "similarity": "78.45%",
    "submittedBy": "User ID: 5",
    "submissionDate": "2024-01-15 10:30:00"
}

Error (400):
{
    "error": "Could not extract text from PDF or it is empty."
}
```

#### Get Assignment List
```
GET /api/assignments/list
Authorization: Bearer {JWT_TOKEN}

Response (200):
{
    "assignments": [
        {
            "id": 1,
            "filename": "assignment_1.pdf",
            "created_at": "2024-01-15 10:30:00",
            "status": "Accepted"
        },
        {
            "id": 2,
            "filename": "assignment_2.pdf",
            "created_at": "2024-01-16 14:22:00",
            "status": "Accepted"
        }
    ]
}
```

---

## 🧠 Duplicate Detection Algorithm

The system uses **three complementary similarity algorithms** for robust duplicate detection:

### 1. **Jaccard Similarity (40% weight)**
- Compares unique words between documents
- Formula: `|Set1 ∩ Set2| / |Set1 ∪ Set2|`
- Best for: Detecting significant content overlap

### 2. **Cosine Similarity (40% weight)**
- Uses Term Frequency (TF) vectors
- Measures angle between document vectors
- Best for: Semantic similarity and word order consideration

### 3. **Longest Common Subsequence Ratio (20% weight)**
- Finds longest matching character sequences
- Formula: `LCS_Length / max(text1_length, text2_length)`
- Best for: Finding verbatim copies

### Combined Score
```
Final Score = (Jaccard × 0.4) + (Cosine × 0.4) + (LCS × 0.2)
```

**Threshold:** 75% similarity = Duplicate flag

---

## 📊 Database Details

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-incremented user ID |
| username | VARCHAR(255) | Unique username |
| password_hash | VARCHAR(255) | Bcrypt hashed password |

### Assignments Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-incremented assignment ID |
| user_id | INT | Foreign key to users table |
| filename | VARCHAR(255) | Original PDF filename |
| content | LONGTEXT | Extracted PDF text content |
| created_at | TIMESTAMP | Submission timestamp |

---

## 🔐 Security Features

✅ **Password Hashing** - Bcrypt with salt rounds = 10
✅ **JWT Authentication** - Tokens expire after 24 hours
✅ **CORS Protection** - Cross-origin requests handled
✅ **SQL Injection Prevention** - Using parameterized queries
✅ **File Validation** - Only PDF files accepted
✅ **Rate Limiting** - Can be added for production

---

## 📁 Project Structure

```
assignment-detector/
├── client/
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── dashboard.html      # Main dashboard
│   └── style.css           # Global styles
├── server/
│   ├── app.js              # Express server setup
│   ├── db.js               # MySQL connection & initialization
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── assignment.js   # Assignment submission routes
│   └── utils/
│       ├── hash.js         # Password hashing utilities
│       └── similarity.js   # Duplicate detection algorithms
├── .env                    # Environment configuration
├── package.json            # Node dependencies
└── README.md               # This file
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Verify MySQL service is running
2. Check `.env` file has correct credentials
3. Confirm database name in `.env` matches MySQL

### Issue: "Cannot extract text from PDF"
**Solution:**
- Try with a different PDF
- Ensure PDF is not image-only or corrupted
- Text-based PDFs work best

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Change PORT in .env file
PORT=3001
```

### Issue: CORS Error when uploading
**Solution:**
- Verify server is running (`http://localhost:3000`)
- Check browser console for specific error
- Clear browser cache and try again

### Issue: "Token is not valid"
**Solution:**
- Log out and log back in
- Clear localStorage: `localStorage.clear()` in console
- Refresh page

---

## 🚀 Production Deployment

To deploy to production:

1. **Use environment-specific `.env` files**
2. **Set strong JWT_SECRET:** Generate using `openssl rand -base64 32`
3. **Use managed MySQL service** (AWS RDS, Azure Database, etc.)
4. **Enable HTTPS/SSL**
5. **Add rate limiting middleware**
6. **Enable CORS only for your domain**
7. **Set NODE_ENV=production**
8. **Use a process manager** (PM2, systemd)

---

## 📈 Future Enhancements

- [ ] Admin dashboard to view all submissions
- [ ] Advanced plagiarism reports with highlighted matching sections
- [ ] Support for multiple file formats (DOCX, images)
- [ ] Email notifications on duplicate detection
- [ ] Two-factor authentication (2FA)
- [ ] Bulk upload for instructors
- [ ] REST API rate limiting
- [ ] Elasticsearch integration for faster searches
- [ ] Machine learning for better similarity detection
- [ ] Docker containerization

---

## 📝 License

This project is provided as-is for educational purposes.

---

## 👨‍💻 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify all steps in Installation Guide
3. Check browser console for error messages
4. Review MySQL logs for database errors

---

## 📧 Contact & Credits

**Project:** Assignment Duplicate Detector - DBMS MySQL Project
**Created:** 2024
**Purpose:** Educational - Prevent duplicate submissions

---

**Happy Detecting! 🎯**
