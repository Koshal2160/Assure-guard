const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

// Auth middleware for users
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// POST /api/queries — user submits a query
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question || question.trim().length === 0) {
            return res.status(400).json({ error: 'Question cannot be empty' });
        }
        await pool.query(
            'INSERT INTO queries (user_id, question) VALUES (?, ?)',
            [req.user.id, question.trim()]
        );
        res.status(201).json({ message: 'Query submitted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/queries — user sees their own queries with answers
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [queries] = await pool.query(
            'SELECT id, question, answer, is_answered, created_at, answered_at FROM queries WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ queries });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
