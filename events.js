const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

// Organizer auth middleware
const organizerMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (decoded.role !== 'organizer' && decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Organizer access required' });
        }
        req.organizer = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// GET /api/events — list all events (now organizer protected)
router.get('/', organizerMiddleware, async (req, res) => {
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

// POST /api/events — create an event
router.post('/', organizerMiddleware, async (req, res) => {
    try {
        const { name, event_time, end_time } = req.body;
        if (!name || !event_time || !end_time) {
            return res.status(400).json({ error: 'Event name, start time, and end time are required' });
        }
        const [result] = await pool.query(
            'INSERT INTO events (name, event_time, end_time) VALUES (?, ?, ?)',
            [name.trim(), event_time, end_time]
        );
        res.status(201).json({ message: 'Event created successfully', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/events/:id/attendees — list attendees for an event
router.get('/:id/attendees', organizerMiddleware, async (req, res) => {
    try {
        const [attendees] = await pool.query(
            'SELECT id, roll_no, student_name, branch, created_at FROM event_attendees WHERE event_id = ? ORDER BY created_at ASC',
            [req.params.id]
        );
        const [[event]] = await pool.query('SELECT name, event_time, end_time FROM events WHERE id = ?', [req.params.id]);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json({ event, attendees });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/events/:id/attendees — add a student to the event
router.post('/:id/attendees', organizerMiddleware, async (req, res) => {
    try {
        const { roll_no, student_name, branch } = req.body;
        const eventId = req.params.id;

        if (!roll_no || !student_name || !branch) {
            return res.status(400).json({ error: 'Roll number, name, and branch are required' });
        }

        const [events] = await pool.query('SELECT id FROM events WHERE id = ?', [eventId]);
        if (events.length === 0) return res.status(404).json({ error: 'Event not found' });

        const [existing] = await pool.query(
            'SELECT id FROM event_attendees WHERE event_id = ? AND roll_no = ?',
            [eventId, roll_no.trim()]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Student is already registered for this event.' });
        }

        await pool.query(
            'INSERT INTO event_attendees (event_id, roll_no, student_name, branch) VALUES (?, ?, ?, ?)',
            [eventId, roll_no.trim(), student_name.trim(), branch.trim()]
        );

        res.status(201).json({ message: 'Student added to event' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/events/:id — delete an event
router.delete('/:id', organizerMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
