const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
console.log('Starting server...');

const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');
const connectDb = require('./Config/db');
const chatRoutes = require('./Routes/Matrimony/chatRoutes');

// Import all routes
const authRoutes = require('./Routes/authRoutes');
const userDetailRoutes = require('./Routes/Matrimony/userDetailRoutes');
const familyDetailRoutes = require('./Routes/Matrimony/familyDetailRoute');
const educationCareerRoutes = require('./Routes/Matrimony/educationCarrerRoute');
const horoscopeRoutes = require('./Routes/Matrimony/horoScopeRoutes');
const matchRoutes = require('./Routes/Matrimony/matchRoutes');
const requestRoutes = require('./Routes/Matrimony/requestRoutes');
const notificationRoutes = require('./Routes/Matrimony/notificationRoutes');



const app = express();
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3000', // React frontend
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
// Serve all static files from public/ with CORS headers
app.use(express.static('public', {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use('/uploads', express.static('public/uploads', {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use('/api/matrimony/chat', chatRoutes);
// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/matrimony', userDetailRoutes);
app.use('/api/matrimony', familyDetailRoutes);
app.use('/api/matrimony', educationCareerRoutes);
app.use('/api/matrimony', horoscopeRoutes);
app.use('/api/matrimony/matches', matchRoutes);
app.use('/api/matrimony/request', requestRoutes);
app.use('/api/matrimony/notifications', notificationRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  // You can add your socket event handlers here
});

// ✅ Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const response = {
    success: false,
    message: err.message || 'Internal server error',
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }
  if (err.details) {
    response.details = err.details;
  }
  res.status(status).json(response);
});

// ✅ Start server after DB connects
const PORT = process.env.PORT || 8000;
connectDb().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

