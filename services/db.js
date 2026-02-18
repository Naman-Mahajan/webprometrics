let prisma = null;

// Initialize Prisma only if DATABASE_URL is provided
if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = require('@prisma/client');
    if (process.env.NODE_ENV !== 'production') {
      if (!global.__prisma) {
        global.__prisma = new PrismaClient();
      }
      prisma = global.__prisma;
    } else {
      prisma = new PrismaClient({
        log: process.env.DEBUG_PRISMA ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    console.log('✓ Prisma client initialized - MySQL database connected');
  } catch (e) {
    // Silently fall back to JSON storage - this is expected if Prisma hasn't been generated
    if (process.env.DEBUG_PRISMA) {
      console.warn('ℹ Prisma not available; using JSON file storage');
    }
    prisma = null;
  }
} else {
  if (process.env.DEBUG_PRISMA) {
    console.log('ℹ DATABASE_URL not set; using JSON file storage');
  }
}

module.exports = prisma;
