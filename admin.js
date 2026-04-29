const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { detectAIContent } = require('../utils/aiDetector');

const router = express.Router();

// Admin auth middleware
const adminMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// GET /api/admin/stats — overall dashboard stats
router.get('/stats', adminMiddleware, async (req, res) => {
    try {
        const [[userCount]] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [[assignmentCount]] = await pool.query('SELECT COUNT(*) as count FROM assignments');
        res.json({
            totalUsers: userCount.count,
            totalAssignments: assignmentCount.count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/users — list all users with their submission counts
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.id, u.username,
                   COUNT(a.id) AS submissionCount,
                   MAX(a.created_at) AS lastSubmission
            FROM users u
            LEFT JOIN assignments a ON a.user_id = u.id
            GROUP BY u.id, u.username
            ORDER BY u.id DESC
        `);
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/assignments — all assignments across all users (with marks)
router.get('/assignments', adminMiddleware, async (req, res) => {
    try {
        const [assignments] = await pool.query(`
            SELECT a.id, a.filename, a.marks, a.created_at,
                   u.username, u.id AS user_id
            FROM assignments a
            JOIN users u ON u.id = a.user_id
            ORDER BY a.created_at DESC
        `);
        res.json({ assignments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/assignments/:id/marks — admin assigns marks (0–10)
router.put('/assignments/:id/marks', adminMiddleware, async (req, res) => {
    try {
        const { marks } = req.body;
        if (marks === undefined || marks === null || marks === '') {
            return res.status(400).json({ error: 'Marks value is required' });
        }
        const marksNum = parseInt(marks, 10);
        if (isNaN(marksNum) || marksNum < 0 || marksNum > 10) {
            return res.status(400).json({ error: 'Marks must be between 0 and 10' });
        }
        await pool.query('UPDATE assignments SET marks = ? WHERE id = ?', [marksNum, req.params.id]);
        res.json({ message: 'Marks assigned successfully', marks: marksNum });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/assignments/:id/ai-check — run AI detection on an assignment
router.get('/assignments/:id/ai-check', adminMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT a.id, a.filename, a.content, u.username FROM assignments a JOIN users u ON u.id = a.user_id WHERE a.id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });

        const assignment = rows[0];
        const result = detectAIContent(assignment.content);
        res.json({ assignmentId: assignment.id, filename: assignment.filename, submittedBy: assignment.username, aiAnalysis: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during AI analysis' });
    }
});

// DELETE /api/admin/assignments/:id — delete an assignment
router.delete('/assignments/:id', adminMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM assignments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/queries — all student queries
router.get('/queries', adminMiddleware, async (req, res) => {
    try {
        const [queries] = await pool.query(`
            SELECT q.id, q.question, q.answer, q.is_answered,
                   q.created_at, q.answered_at, u.username
            FROM queries q
            JOIN users u ON u.id = q.user_id
            ORDER BY q.is_answered ASC, q.created_at DESC
        `);
        res.json({ queries });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/queries/:id/answer — admin answers a query
router.put('/queries/:id/answer', adminMiddleware, async (req, res) => {
    try {
        const { answer } = req.body;
        if (!answer || answer.trim().length === 0) {
            return res.status(400).json({ error: 'Answer cannot be empty' });
        }
        await pool.query(
            'UPDATE queries SET answer = ?, is_answered = 1, answered_at = NOW() WHERE id = ?',
            [answer.trim(), req.params.id]
        );
        res.json({ message: 'Query answered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/search?q= — search users and assignments
router.get('/search', adminMiddleware, async (req, res) => {
    try {
        const q = `%${req.query.q || ''}%`;
        const [users] = await pool.query(
            `SELECT id, username, roll_no, branch FROM users WHERE username LIKE ? OR roll_no LIKE ? OR branch LIKE ? LIMIT 20`,
            [q, q, q]
        );
        const [assignments] = await pool.query(
            `SELECT a.id, a.filename, a.marks, a.created_at, u.username, u.roll_no, u.branch
             FROM assignments a JOIN users u ON u.id = a.user_id
             WHERE u.username LIKE ? OR u.roll_no LIKE ? OR a.filename LIKE ? LIMIT 20`,
            [q, q, q]
        );
        res.json({ users, assignments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/users — now includes roll_no and branch
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.id, u.username, u.roll_no, u.branch,
                   COUNT(a.id) AS submissionCount,
                   MAX(a.created_at) AS lastSubmission
            FROM users u
            LEFT JOIN assignments a ON a.user_id = u.id
            GROUP BY u.id, u.username, u.roll_no, u.branch
            ORDER BY u.id DESC
        `);
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── Events Management ──────────────────────────────────────────────────────

// GET /api/admin/events — list all events with attendee counts
router.get('/events', adminMiddleware, async (req, res) => {
    try {
        const [events] = await pool.query(`
            SELECT e.id, e.name, e.event_time, e.end_time, e.created_at,
                   COUNT(a.id) AS attendeeCount
            FROM events e
            LEFT JOIN event_attendees a ON a.event_id = e.id
            GROUP BY e.id
            ORDER BY e.event_time DESC
        `);
        res.json({ events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/events/:id/attendees — list attendees for an event
router.get('/events/:id/attendees', adminMiddleware, async (req, res) => {
    try {
        const [attendees] = await pool.query(
            'SELECT id, roll_no, student_name, branch, created_at FROM event_attendees WHERE event_id = ? ORDER BY created_at ASC',
            [req.params.id]
        );
        const [[event]] = await pool.query('SELECT name, event_time, end_time FROM events WHERE id = ?', [req.params.id]);
        res.json({ event, attendees });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

