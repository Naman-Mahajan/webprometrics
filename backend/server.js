// Main backend entry point
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api.js');
const errorHandler = require('./middleware/errorHandler.js');
const { connectDb } = require('./config/db.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to DB
connectDb();

// Middleware
app.use(helmet({ contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Error Handler
app.use(errorHandler);


// Global error handlers to prevent Passenger from crashing
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

module.exports = app;
