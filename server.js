const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
console.log('Starting server...');

const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');
const { verifyToken } = require('./utils/jwt');
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
const adminRoutes = require('./Routes/adminRoutes');

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
// Register preferences route for /api/matrimony/preferences
const preferenceRoutes = require('./Routes/Matrimony/preferenceRoutes');
app.use('/api/matrimony/preferences', preferenceRoutes);
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware to authenticate socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    // Verify the token using the utility function
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }
    
    socket.userId = decoded.id; // Use 'id' field from JWT
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Store user connection
  connectedUsers.set(socket.userId, socket.id);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle chat messages
  socket.on('send_message', (data) => {
    const { receiverId, message } = data;
    
    // Emit to receiver if online
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        senderId: socket.userId,
        message: message,
        timestamp: new Date()
      });
    }
    
    // Also emit back to sender for confirmation
    socket.emit('message_sent', {
      receiverId: receiverId,
      message: message,
      timestamp: new Date()
    });
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', {
        userId: socket.userId
      });
    }
  });

  socket.on('typing_stop', (data) => {
    const { receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_stopped_typing', {
        userId: socket.userId
      });
    }
  });

  // Handle user status
  socket.on('user_online', () => {
    // Notify other users that this user is online
    socket.broadcast.emit('user_status_changed', {
      userId: socket.userId,
      status: 'online'
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
    
    // Notify other users that this user is offline
    socket.broadcast.emit('user_status_changed', {
      userId: socket.userId,
      status: 'offline'
    });
  });
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

