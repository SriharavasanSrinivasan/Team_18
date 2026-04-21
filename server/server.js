require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB().then(async () => {
    const { seedUsers, seedBusData } = require('./utils/seeder');
    await seedUsers();
    await seedBusData();
});

const app = express();
const server = http.createServer(app);

// Configure allowed origins for CORS and Socket.io
const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:5173', 'http://localhost:3000', '*'];

const io = new Server(server, {
    cors: { 
        origin: allowedOrigins, 
        methods: ['GET', 'POST'] 
    },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: allowedOrigins
}));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/buses', require('./routes/busRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));

// Serve Frontend Static Files in Production
if (process.env.NODE_ENV === 'production') {
    // Serve the "dist" folder from the client
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // For any other route, serve index.html to support React Router (SPA)
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    // Health check (only for local dev if not serving static)
    app.get('/', (req, res) => res.send('🚌 College Bus Tracking API is Running...'));
    app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));
}

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
