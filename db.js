const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'assignment_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
});

async function initDB() {
    try {
        console.log('🔌 Attempting to connect to MySQL...');
        
        // Create database if it doesn't exist
        const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        console.log('✅ Connected to MySQL Server');
        
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'assignment_db'}\``);
        console.log(`✅ Database "${process.env.DB_NAME || 'assignment_db'}" created/verified`);
        
        await tempConnection.end();

        // Create tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table verified');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                filename VARCHAR(255) NOT NULL,
                content LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('✅ Assignments table verified');

        // Add marks column if it doesn't exist (migration)
        try {
            await pool.query('ALTER TABLE assignments ADD COLUMN marks TINYINT UNSIGNED DEFAULT NULL');
            console.log('✅ Marks column added to assignments');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
            console.log('✅ Marks column already exists');
        }

        // Create queries table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS queries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT DEFAULT NULL,
                is_answered TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                answered_at TIMESTAMP DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            )
        `);
        console.log('✅ Queries table verified');

        // Migrate users table: add roll_no and branch columns
        for (const col of [
            "ALTER TABLE users ADD COLUMN roll_no VARCHAR(50) DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN branch VARCHAR(100) DEFAULT NULL"
        ]) {
            try {
                await pool.query(col);
            } catch (e) {
                if (e.code !== 'ER_DUP_FIELDNAME') throw e;
            }
        }
        console.log('✅ Users roll_no/branch columns verified');

        // Create events table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                event_time DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Events table verified');

        // Migrate events table: add end_time column
        try {
            await pool.query("ALTER TABLE events ADD COLUMN end_time DATETIME DEFAULT NULL");
            console.log('✅ Events end_time column verified');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        }

        // Create event_attendees table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS event_attendees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_id INT NOT NULL,
                roll_no VARCHAR(50) NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                branch VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                UNIQUE KEY unique_event_roll (event_id, roll_no)
            )
        `);
        console.log('✅ Event attendees table verified');

        // Verify data integrity
        const [tables] = await pool.query('SHOW TABLES');
        console.log(`\n📊 Database Summary:`);
        console.log(`   Tables: ${tables.length}`);
        
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log(`   Users: ${userCount[0].count}`);
        
        const [assignmentCount] = await pool.query('SELECT COUNT(*) as count FROM assignments');
        console.log(`   Assignments: ${assignmentCount[0].count}\n`);

        console.log('✨ Database initialization completed successfully!');
    } catch (err) {
        console.error('\n❌ Database initialization failed:');
        console.error(err.message);
        
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('   → MySQL connection lost. Is MySQL running?');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   → Access denied. Check DB_USER and DB_PASSWORD in .env');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('   → Database does not exist. Check DB_NAME in .env');
        }
        
        console.error('\n📝 Troubleshooting Steps:');
        console.error('   1. Verify MySQL service is running');
        console.error('   2. Check .env file has correct credentials');
        console.error('   3. Ensure MySQL root password is correct');
        process.exit(1);
    }
}

module.exports = { pool, initDB };
