const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const tripRouter = require('./routes/tripRoutes.js');
const ErrorUtil = require("./utils/errorUtil");
const userRouter = require("./routes/userRoutes.js");
const authRouter = require("./routes/authRoutes.js");
const { weatherRouter } = require("./utils/thirdPartyApis.js");
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Create an instance of the Express application
const app = express();

// Create the HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server);

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

// Use middleware to parse JSON data from request bodies
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/trips', tripRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// Chat route to serve the chat page
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle unhandled routes
app.all('*', (req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.status = 'fail';
  error.statusCode = 404;

  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  next();
});

module.exports = {
  app,
  server,
};
