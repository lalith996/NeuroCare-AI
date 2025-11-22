/**
 * Database Migration Runner
 * Run with: npx ts-node src/scripts/run-migrations.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Read the SQL migration file
    const migrationPath = join(__dirname, '..', 'migrations', '001_comprehensive_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Reading migration file:', migrationPath);

    // Execute the migration
    console.log('⚙️  Executing migration...\n');
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables in neurocare schema...\n');
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'neurocare'
      ORDER BY table_name
    `);

    console.log(`📊 Found ${result.rows.length} tables:\n`);
    result.rows.forEach((row: any) => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('\n🎉 Database is ready!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
