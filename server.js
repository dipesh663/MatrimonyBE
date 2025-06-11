const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
console.log('Starting server...');

const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');
const connectDb = require('./Config/db');

const authRoutes = require('./Routes/authRoutes');
const userProfileRoutes = require('./Routes/Matrimony/userProfileRoutes');
const userRegisterRoutes = require('./Routes/userRegisterRoutes');
const userPreferenceRoutes = require('./Routes/Matrimony/userPreferenceRoutes');
const requestRoutes = require('./Routes/Matrimony/requestRoutes');
const chatRoutes = require('./Routes/Matrimony/chatRoutes');



const app = express();
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3000', // React frontend
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/reg', userRegisterRoutes);
app.use('/user', userProfileRoutes);
app.use('/preference', userPreferenceRoutes);
app.use('/request', requestRoutes);
app.use('/chat', chatRoutes);

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
  res.status(500).json({ error: err.message });
});

// ✅ Start server after DB connects
const PORT = 8000;
connectDb().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

