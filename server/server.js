// Load .env only in local development (Render injects env vars directly)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB().then(async () => {
    const { seedUsers, seedBusData, seedTeamMembers } = require('./utils/seeder');
    await seedUsers();
    await seedBusData();
    await seedTeamMembers();
});

const app = express();
const server = http.createServer(app);

// Allowed origins: local dev + deployed Vercel frontend
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (Render health checks, curl, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/buses', require('./routes/busRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/members', require('./routes/teamRoutes'));
app.use('/members', require('./routes/teamRoutes'));

// Health check — always available (Render uses this to verify the service is live)
app.get('/api/health', async (req, res) => {
    try {
        const busCount = await require('./models/Bus').countDocuments({ isActive: true });
        res.json({ status: 'OK', time: new Date(), busCount });
    } catch (err) {
        res.json({ status: 'OK', time: new Date(), error: err.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('🚌 College Bus Tracking API is Running...');
});

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// Render sets its own PORT via environment — always use process.env.PORT
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
