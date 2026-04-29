const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { hashPassword, comparePassword } = require('../utils/hash');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password, roll_no, branch } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        if (!roll_no || !branch) {
            return res.status(400).json({ error: 'Roll number and branch are required' });
        }

        // Check if user exists
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Check if roll number already registered
        const [existingRoll] = await pool.query('SELECT id FROM users WHERE roll_no = ?', [roll_no]);
        if (existingRoll.length > 0) {
            return res.status(400).json({ error: 'Roll number already registered' });
        }

        // Hash password and insert with roll_no and branch
        const hashed = await hashPassword(password);
        await pool.query(
            'INSERT INTO users (username, password_hash, roll_no, branch) VALUES (?, ?, ?, ?)',
            [username, hashed, roll_no.trim(), branch.trim()]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, roll_no: user.roll_no, branch: user.branch },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
