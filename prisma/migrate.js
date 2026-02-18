#!/usr/bin/env node

/**
 * Prisma Database Migration Manager
 * Handles migration creation, deployment, rollback, and verification
 * 
 * Usage:
 *   node prisma/migrate.js create <name>    - Create new migration
 *   node prisma/migrate.js deploy           - Deploy migrations to database
 *   node prisma/migrate.js rollback         - Rollback last migration
 *   node prisma/migrate.js status           - Show migration status
 *   node prisma/migrate.js list             - List all migrations
 *   node prisma/migrate.js verify           - Verify schema integrity
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRISMA_DIR = path.join(__dirname, 'prisma');
const MIGRATIONS_DIR = path.join(PRISMA_DIR, 'migrations');
const MIGRATION_LOG = path.join(PRISMA_DIR, '.migration_history.json');

// Ensure migrations directory exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
}

// Migration history structure
const getMigrationHistory = () => {
  if (!fs.existsSync(MIGRATION_LOG)) {
    return {
      version: '1.0',
      migrations: [],
      lastApplied: null,
      lastRolledBack: null,
      createdAt: new Date().toISOString()
    };
  }
  return JSON.parse(fs.readFileSync(MIGRATION_LOG, 'utf8'));
};

const saveMigrationHistory = (history) => {
  fs.writeFileSync(MIGRATION_LOG, JSON.stringify(history, null, 2));
};

const getMigrationName = (name) => {
  const timestamp = new Date().toISOString().replace(/[:\-.]/g, '').slice(0, 14);
  return `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}`;
};

const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    const process = spawn('npx', [command, ...args], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });

    process.on('error', reject);
  });
};

// Commands

const createMigration = async (name) => {
  console.log(`\n📝 Creating migration: ${name}`);
  const migrationName = getMigrationName(name);
  
  try {
    await runCommand('prisma', ['migrate', 'dev', '--name', name, '--create-only']);
    
    const history = getMigrationHistory();
    history.migrations.push({
      name: migrationName,
      description: name,
      createdAt: new Date().toISOString(),
      status: 'pending',
      appliedAt: null
    });
    saveMigrationHistory(history);
    
    console.log(`✅ Migration created: ${migrationName}`);
    console.log(`📂 Location: ${MIGRATIONS_DIR}/${migrationName}`);
    console.log(`\n💡 Next: Edit the migration file, then run: node prisma/migrate.js deploy\n`);
  } catch (error) {
    console.error('❌ Migration creation failed:', error.message);
    process.exit(1);
  }
};

const deployMigrations = async () => {
  console.log(`\n🚀 Deploying migrations to database...`);
  
  try {
    await runCommand('prisma', ['migrate', 'deploy']);
    
    const history = getMigrationHistory();
    const pendingMigrations = history.migrations.filter(m => m.status === 'pending');
    
    pendingMigrations.forEach(m => {
      m.status = 'applied';
      m.appliedAt = new Date().toISOString();
    });
    
    history.lastApplied = new Date().toISOString();
    saveMigrationHistory(history);
    
    console.log(`✅ ${pendingMigrations.length} migration(s) deployed successfully`);
    console.log(`📊 Total applied: ${history.migrations.filter(m => m.status === 'applied').length}\n`);
  } catch (error) {
    console.error('❌ Migration deployment failed:', error.message);
    process.exit(1);
  }
};

const rollbackMigration = async () => {
  console.log(`\n⏮️  Rolling back last migration...`);
  
  try {
    const history = getMigrationHistory();
    const appliedMigrations = history.migrations.filter(m => m.status === 'applied');
    
    if (appliedMigrations.length === 0) {
      console.log('ℹ️  No migrations to rollback');
      return;
    }
    
    const lastMigration = appliedMigrations[appliedMigrations.length - 1];
    
    // Prisma doesn't have built-in rollback, so we log this for manual review
    console.log(`⚠️  Prisma doesn't support automatic rollback. Manual steps:`);
    console.log(`\n1. Remove migration folder: ${MIGRATIONS_DIR}/${lastMigration.name}`);
    console.log(`2. Manually revert database schema changes (or restore from backup)`);
    console.log(`3. Delete migration record from _prisma_migrations table`);
    console.log(`\nOr restore from backup if available.\n`);
    
    lastMigration.status = 'rolled_back';
    lastMigration.rolledBackAt = new Date().toISOString();
    history.lastRolledBack = new Date().toISOString();
    saveMigrationHistory(history);
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    process.exit(1);
  }
};

const showStatus = () => {
  console.log(`\n📊 Migration Status`);
  console.log(`${'='.repeat(60)}`);
  
  const history = getMigrationHistory();
  
  if (history.migrations.length === 0) {
    console.log('No migrations found.');
    return;
  }
  
  const applied = history.migrations.filter(m => m.status === 'applied');
  const pending = history.migrations.filter(m => m.status === 'pending');
  const rolledBack = history.migrations.filter(m => m.status === 'rolled_back');
  
  console.log(`\nApplied: ${applied.length}`);
  applied.forEach(m => {
    console.log(`  ✅ ${m.name} (${new Date(m.appliedAt).toLocaleString()})`);
  });
  
  if (pending.length > 0) {
    console.log(`\nPending: ${pending.length}`);
    pending.forEach(m => {
      console.log(`  ⏳ ${m.name}`);
    });
  }
  
  if (rolledBack.length > 0) {
    console.log(`\nRolled Back: ${rolledBack.length}`);
    rolledBack.forEach(m => {
      console.log(`  ↩️  ${m.name}`);
    });
  }
  
  console.log(`\nLast Applied: ${history.lastApplied ? new Date(history.lastApplied).toLocaleString() : 'None'}`);
  console.log(`${'='.repeat(60)}\n`);
};

const listMigrations = () => {
  console.log(`\n📋 Migration History`);
  console.log(`${'='.repeat(60)}`);
  
  const history = getMigrationHistory();
  
  if (history.migrations.length === 0) {
    console.log('No migrations found.');
    return;
  }
  
  history.migrations.forEach((m, i) => {
    const status = {
      applied: '✅',
      pending: '⏳',
      rolled_back: '↩️ '
    }[m.status] || '❓';
    
    console.log(`${i + 1}. ${status} ${m.name}`);
    console.log(`   Description: ${m.description}`);
    console.log(`   Status: ${m.status}`);
    if (m.appliedAt) console.log(`   Applied: ${new Date(m.appliedAt).toLocaleString()}`);
    console.log();
  });
  
  console.log(`${'='.repeat(60)}\n`);
};

const verifySchema = async () => {
  console.log(`\n🔍 Verifying schema integrity...`);
  
  try {
    // Generate Prisma client to validate schema
    await runCommand('prisma', ['generate']);
    
    // Check if schema is in sync with database
    await runCommand('prisma', ['migrate', 'status']);
    
    console.log(`✅ Schema verification passed\n`);
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    process.exit(1);
  }
};

// Main CLI
const command = process.argv[2];
const args = process.argv.slice(3);

(async () => {
  try {
    switch (command) {
      case 'create':
        if (!args[0]) {
          console.error('❌ Migration name required. Usage: node prisma/migrate.js create <name>');
          process.exit(1);
        }
        await createMigration(args[0]);
        break;
      
      case 'deploy':
        await deployMigrations();
        break;
      
      case 'rollback':
        await rollbackMigration();
        break;
      
      case 'status':
        showStatus();
        break;
      
      case 'list':
        listMigrations();
        break;
      
      case 'verify':
        await verifySchema();
        break;
      
      default:
        console.log(`\n📚 Prisma Migration Manager\n`);
        console.log(`Usage:\n`);
        console.log(`  node prisma/migrate.js create <name>    - Create new migration`);
        console.log(`  node prisma/migrate.js deploy           - Deploy migrations to database`);
        console.log(`  node prisma/migrate.js rollback         - Rollback last migration`);
        console.log(`  node prisma/migrate.js status           - Show migration status`);
        console.log(`  node prisma/migrate.js list             - List all migrations`);
        console.log(`  node prisma/migrate.js verify           - Verify schema integrity\n`);
        console.log(`Example:\n`);
        console.log(`  node prisma/migrate.js create "add_user_fields"`);
        console.log(`  node prisma/migrate.js deploy\n`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
