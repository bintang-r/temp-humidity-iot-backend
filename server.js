require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');
const { initDB } = require('./config/db');
const { logError } = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

// Make io accessible to our router
app.set('socketio', io);

// Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('DHT11 Realtime Server is running');
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  logError('BACKEND_EXPRESS', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Process-level Error Handlers
process.on('uncaughtException', (err) => {
  logError('BACKEND_UNCAUGHT_EXCEPTION', { message: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason, promise) => {
  logError('BACKEND_UNHANDLED_REJECTION', { reason: reason });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
