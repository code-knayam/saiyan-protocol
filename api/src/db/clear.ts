import { pool, closePool } from './pool.js';

const TABLES = [
  'ai_generation_logs',
  'set_logs',
  'exercise_logs',
  'session_logs',
  'exercises',
  'workout_phases',
  'workouts',
  'week_schedules',
  'training_plan_blocks',
  'training_plans',
  'athletes',
];

async function clearDatabase() {
  console.log('Clearing all Saiyan Protocol data...');
  try {
    await pool.query(`TRUNCATE TABLE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);
    console.log('Database data cleared. Schema and tables remain intact.');
  } catch (err) {
    console.error('Database clear failed:', err);
    process.exit(1);
  } finally {
    await closePool();
  }
}

clearDatabase();
