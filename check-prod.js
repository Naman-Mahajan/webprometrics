#!/usr/bin/env node
/**
 * Production Readiness Test Suite
 * Validates all critical aspects before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    tests.push({ name, status: '✅ PASS' });
    passed++;
  } catch (error) {
    tests.push({ name, status: `❌ FAIL: ${error.message}` });
    failed++;
  }
}

console.log('🧪 Running Production Readiness Tests...\n');

// Test 1: Check required files exist
test('dist/ folder exists', () => {
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    throw new Error('dist/ folder not found. Run: npm run build');
  }
});

test('dist/index.html exists', () => {
  if (!fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
    throw new Error('dist/index.html not found. Run: npm run build');
  }
});

test('server.js exists', () => {
  if (!fs.existsSync(path.join(__dirname, 'server.js'))) {
    throw new Error('server.js not found');
  }
});

test('db.json exists', () => {
  if (!fs.existsSync(path.join(__dirname, 'db.json'))) {
    throw new Error('db.json not found');
  }
});

// Test 2: Check environment variables
test('.env file exists', () => {
  if (!fs.existsSync(path.join(__dirname, '.env'))) {
    throw new Error('.env file not found');
  }
});

test('JWT_SECRET is set', () => {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  if (!envContent.includes('JWT_SECRET=') || envContent.includes('JWT_SECRET=your-super-secret')) {
    throw new Error('JWT_SECRET not properly set in .env');
  }
});

test('NODE_ENV is production', () => {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  if (!envContent.includes('NODE_ENV=production')) {
    throw new Error('NODE_ENV should be set to production');
  }
});

// Test 3: Check db.json structure
test('db.json has valid structure', () => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));
  if (!db.users || !Array.isArray(db.users)) {
    throw new Error('db.json missing users array');
  }
  if (!db.clients || !Array.isArray(db.clients)) {
    throw new Error('db.json missing clients array');
  }
});

test('Admin user exists in db.json', () => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));
  const admin = db.users.find(u => u.role === 'ADMIN');
  if (!admin) {
    throw new Error('No admin user found in database');
  }
});

test('Agency owner exists in db.json', () => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));
  const owner = db.users.find(u => u.email === 'marubefred02@gmail.com');
  if (!owner) {
    throw new Error('Agency owner account not found');
  }
});

// Test 4: Check package.json
test('package.json has required dependencies', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  const required = ['express', 'cors', 'jsonwebtoken', 'bcryptjs', 'dotenv'];
  const missing = required.filter(dep => !pkg.dependencies[dep]);
  if (missing.length > 0) {
    throw new Error(`Missing dependencies: ${missing.join(', ')}`);
  }
});

test('node_modules exists', () => {
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    throw new Error('node_modules not found. Run: npm install');
  }
});

// Print results
console.log('📊 Test Results:\n');
tests.forEach(t => console.log(`${t.status} - ${t.name}`));

console.log(`\n${'='.repeat(50)}`);
console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
  console.log('\n❌ Production readiness check FAILED');
  console.log('Fix the issues above before deploying to production.\n');
  process.exit(1);
} else {
  console.log('\n✅ Production readiness check PASSED');
  console.log('Server is ready for production deployment!\n');
  console.log('To start the server, run:');
  console.log('  node server.js\n');
  process.exit(0);
}
