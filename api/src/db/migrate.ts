import { pool, closePool } from './pool.js';
import { SCHEMA_SQL } from './schema.js';

async function migrate() {
  console.log('🔧 Running database migration...');
  try {
    await pool.query(SCHEMA_SQL);
    console.log('✅ Migration complete.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await closePool();
  }
}

migrate();
