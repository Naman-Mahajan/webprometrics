/**
 * Test Server Startup
 * Diagnoses issues preventing the server from binding to port 8080
 */

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test server is running' });
});

app.get('/', (req, res) => {
  res.send('Test server homepage - if you see this, the server is working!');
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server successfully started on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/health`);
  console.log(`🔗 http://localhost:${PORT}/`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the process or choose another port.`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
