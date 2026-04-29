const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { calculateSimilarity } = require('../utils/similarity');

const router = express.Router();

// Setup Multer for file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

router.post('/submit', authMiddleware, upload.single('assignment'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate file size (10MB max)
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(413).json({ error: 'File size exceeds 10MB limit' });
        }

        // Parse PDF to extract text
        let pdfData;
        try {
            pdfData = await pdfParse(req.file.buffer);
        } catch (pdfErr) {
            return res.status(400).json({ error: 'Invalid PDF file. Please ensure the file is a valid PDF.' });
        }

        const newText = pdfData.text;

        if (!newText || newText.trim().length === 0) {
             return res.status(400).json({ error: 'Could not extract text from PDF. Ensure PDF contains readable text content.' });
        }

        // Get all previous assignments (excluding current user's)
        const [previousAssignments] = await pool.query('SELECT id, user_id, filename, content, created_at FROM assignments WHERE user_id != ?', [req.user.id]);

        // Check for duplicates using advanced similarity algorithms
        const SIMILARITY_THRESHOLD = 0.75; // 75% similarity threshold
        let maxSimilarity = 0;
        let matchedAssignment = null;

        for (const assignment of previousAssignments) {
            const similarity = calculateSimilarity(newText, assignment.content);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                matchedAssignment = assignment;
            }
            if (similarity >= SIMILARITY_THRESHOLD) {
                return res.status(409).json({ 
                    error: 'You are trying to submit a duplicate assignment.',
                    similarity: (similarity * 100).toFixed(2) + '%',
                    submittedBy: `User ID: ${assignment.user_id}`,
                    submissionDate: assignment.created_at
                });
            }
        }

        // If no duplicate, save to database
        await pool.query(
            'INSERT INTO assignments (user_id, filename, content) VALUES (?, ?, ?)',
            [req.user.id, req.file.originalname, newText]
        );

        res.status(201).json({ 
            message: 'Assignment submitted successfully!',
            similarity: maxSimilarity > 0 ? (maxSimilarity * 100).toFixed(2) + '%' : 'N/A'
        });
    } catch (err) {
        console.error('❌ Assignment submission error:', err);
        res.status(500).json({ error: 'Server error while processing assignment' });
    }
});

router.get('/list', authMiddleware, async (req, res) => {
    try {
        const [assignments] = await pool.query(
            'SELECT id, filename, marks, created_at FROM assignments WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ assignments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
