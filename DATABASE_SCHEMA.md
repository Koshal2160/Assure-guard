# 📊 Database Schema Reference

Complete reference for the Assignment Detector database structure.

---

## Database Overview

**Database Name:** `assignment_db`

**Tables:**
1. `users` - Student/User accounts
2. `assignments` - Submitted assignments and their content

---

## Table 1: Users

Stores user account information with password hashing.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Column Details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `username` | VARCHAR(255) | NOT NULL, UNIQUE | Username for login (no duplicates) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password (never store plain text) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

### Example Data
```
id  | username      | password_hash                                    | created_at
----|---------------|--------------------------------------------------|-----------------------
1   | john_student  | $2a$10$kL9p1Z9M8x7Q2k1P3X4Y5Z... | 2024-01-15 10:30:00
2   | jane_student  | $2a$10$aB5c2D9E1F3G4H5I6J7K8L... | 2024-01-15 11:45:00
```

### Indexes
- `PRIMARY KEY (id)` - Fast user lookup by ID
- `UNIQUE (username)` - Ensures username uniqueness, fast login

### Notes
- Passwords are never stored in plain text
- Use bcrypt with 10 salt rounds for hashing
- `created_at` helps track when accounts were created

---

## Table 2: Assignments

Stores submitted assignments with extracted PDF content.

```sql
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### Column Details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique assignment identifier |
| `user_id` | INT | NOT NULL, FOREIGN KEY | Links to student who submitted |
| `filename` | VARCHAR(255) | NOT NULL | Original PDF filename |
| `content` | LONGTEXT | NOT NULL | Full extracted text from PDF |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |

### Example Data
```
id | user_id | filename              | content (truncated)            | created_at
---|---------|----------------------|---------------------------------|---------------------
1  | 1       | assignment_1.pdf     | Assignment 1 Title... [2000+]  | 2024-01-15 10:35:00
2  | 2       | data_structures.pdf  | Chapter 1: Arrays and Lists... | 2024-01-15 11:50:00
3  | 1       | databases_intro.pdf  | Database Management Systems... | 2024-01-16 14:20:00
```

### Indexes
- `PRIMARY KEY (id)` - Fast assignment lookup
- `FOREIGN KEY (user_id)` - Links to users table
- `INDEX idx_user_id (user_id)` - Fast queries by user
- `INDEX idx_created_at (created_at)` - Fast sorting by date

### Constraints

**Foreign Key Relationship:**
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- If user is deleted, all their assignments are deleted automatically
- Prevents orphaned records

---

## Relationships

```
users (1) ----< (Many) assignments
   id                user_id
```

**One-to-Many Relationship:**
- One user can have many assignments
- Each assignment belongs to exactly one user
- Enforced by foreign key

---

## Query Examples

### Get all assignments for a user
```sql
SELECT * FROM assignments 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

### Find assignments by filename
```sql
SELECT a.*, u.username 
FROM assignments a
JOIN users u ON a.user_id = u.id
WHERE a.filename LIKE '%database%';
```

### Count assignments per user
```sql
SELECT 
    u.username, 
    COUNT(a.id) as assignment_count,
    MAX(a.created_at) as last_submission
FROM users u
LEFT JOIN assignments a ON u.id = a.user_id
GROUP BY u.id, u.username
ORDER BY assignment_count DESC;
```

### Find recent submissions (last 7 days)
```sql
SELECT 
    u.username,
    a.filename,
    a.created_at
FROM assignments a
JOIN users u ON a.user_id = u.id
WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY a.created_at DESC;
```

### Get statistics
```sql
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(a.id) as total_assignments,
    AVG(LENGTH(a.content)) as avg_assignment_size_chars
FROM users u
LEFT JOIN assignments a ON u.id = a.user_id;
```

---

## Data Size Considerations

### LONGTEXT Column
- `content` column uses LONGTEXT (stores up to 4GB)
- For typical assignments (10-50 pages): ~100KB per assignment
- Efficient storage with proper indexing

### Performance Tips
1. Don't retrieve `content` column if not needed - use projections
2. Use indexes for frequent queries (user_id, created_at)
3. Archive old assignments after 1 year to maintain performance
4. Use pagination for large result sets

---

## Backup & Recovery

### Backup MySQL Database
```bash
# Backup entire database
mysqldump -u root -p assignment_db > assignment_db_backup.sql

# Backup with timestamp
mysqldump -u root -p assignment_db > assignment_db_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup
```bash
# Restore database
mysql -u root -p assignment_db < assignment_db_backup.sql
```

---

## Maintenance

### Check Data Integrity
```sql
-- Verify all assignments have valid user_id
SELECT COUNT(*) as orphaned_assignments
FROM assignments a
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = a.user_id);
```

### Analyze Tables (optimize performance)
```sql
ANALYZE TABLE users;
ANALYZE TABLE assignments;
```

### Check Table Size
```sql
SELECT 
    TABLE_NAME,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'assignment_db';
```

---

## Security Best Practices

✅ **Always use parameterized queries** (prepared statements)
```javascript
// Good - prevents SQL injection
await pool.query('SELECT * FROM users WHERE username = ?', [username]);

// Bad - vulnerable to SQL injection
await pool.query(`SELECT * FROM users WHERE username = '${username}'`);
```

✅ **Never log sensitive data**
```javascript
// Good - only log non-sensitive info
console.log(`User ${userId} submitted assignment`);

// Bad - don't log passwords or tokens
console.log(user.password_hash);
```

✅ **Hash passwords before storage**
- Always use bcrypt or similar
- Set appropriate salt rounds (10+)
- Never compare plain text passwords

✅ **Use foreign keys**
- Enforces referential integrity
- Prevents orphaned records
- Use CASCADE delete carefully

---

## Migration from Other Systems

If migrating from another system, map your data like this:

### From CSV
```
CSV Columns → Database Columns
filename    → assignments.filename
content     → assignments.content
student_id  → users.id (or create mapping)
date        → assignments.created_at
```

### SQL Script Example
```sql
-- Create staging table
CREATE TABLE assignments_staging (
    csv_filename VARCHAR(255),
    csv_content LONGTEXT,
    csv_student_id INT,
    csv_date DATETIME
);

-- Load data from CSV
LOAD DATA INFILE '/path/to/data.csv'
INTO TABLE assignments_staging
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Migrate to production tables
INSERT INTO assignments (user_id, filename, content, created_at)
SELECT 
    csv_student_id,
    csv_filename,
    csv_content,
    csv_date
FROM assignments_staging;

-- Clean up
DROP TABLE assignments_staging;
```

---

## Troubleshooting

### Error: "Duplicate entry for key 'username'"
**Cause:** Username already exists
**Solution:** Use different username or check for duplicates

### Error: "Cannot delete or update a parent row"
**Cause:** Trying to delete user with assignments (FK constraint)
**Solution:** Delete assignments first, or use CASCADE delete

### Error: "Disk space exceeded"
**Cause:** Database files too large
**Solution:** Archive old assignments or increase disk space

### Query Performance Issues
**Solution Steps:**
1. Check indexes: `SHOW INDEX FROM assignments;`
2. Analyze table: `ANALYZE TABLE assignments;`
3. Use EXPLAIN: `EXPLAIN SELECT ... FROM assignments WHERE ...;`
4. Consider archiving old data

---

## Monitoring

### Check Current Connections
```sql
SHOW PROCESSLIST;
```

### Check Query Logs
```sql
-- Enable slow query log (MySQL config)
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### Table Statistics
```sql
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    AVG_ROW_LENGTH,
    DATA_FREE
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'assignment_db';
```

---

**For more information, refer to MySQL Documentation:**
https://dev.mysql.com/doc/refman/8.0/en/
