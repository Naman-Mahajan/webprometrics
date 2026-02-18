#!/usr/bin/env node
// Simple server startup wrapper for production
import dotenv from 'dotenv';
dotenv.config();

// Force production
process.env.NODE_ENV = 'production';

import('./server.js').catch(err => {
  console.error('Failed to load server:', err);
  process.exit(1);
});
