const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const assignmentRoutes = require('./routes/assignment');
const adminRoutes = require('./routes/admin');
const queriesRoutes = require('./routes/queries');
const eventsRoutes = require('./routes/events');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Initialize Database
initDB().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/queries', queriesRoutes);
app.use('/api/events', eventsRoutes);

// Admin Login endpoint (credentials from .env, no DB lookup needed)
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUser && password === adminPass) {
        const token = require('jsonwebtoken').sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
        return res.json({ message: 'Admin login successful', token });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
});

// Organizer Login endpoint
app.post('/api/events/login', (req, res) => {
    const { username, password } = req.body;
    const orgUser = process.env.EVENT_ORGANIZER_USERNAME || 'organizer';
    const orgPass = process.env.EVENT_ORGANIZER_PASSWORD || 'org123';

    if (username === orgUser && password === orgPass) {
        const token = require('jsonwebtoken').sign(
            { username, role: 'organizer' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
        return res.json({ message: 'Organizer login successful', token });
    }
    return res.status(401).json({ error: 'Invalid organizer credentials' });
});

// Serve static files (catch-all for SPA)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`${'='.repeat(50)}\n`);
    console.log('📝 Quick Links:');
    console.log(`   • Homepage: http://localhost:${PORT}`);
    console.log(`   • Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   • API Register: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   • API Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`\n💡 Press Ctrl+C to stop the server\n`);
});
