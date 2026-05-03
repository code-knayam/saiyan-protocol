import pg from 'pg';
import { config } from '../config.js';

const { Client } = pg;

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

async function createDatabase() {
  const targetUrl = new URL(config.db.url);
  const databaseName = targetUrl.pathname.replace(/^\//, '');

  if (!databaseName) {
    throw new Error('DATABASE_URL must include a database name.');
  }

  const adminUrl = new URL(targetUrl.toString());
  adminUrl.pathname = '/postgres';

  const client = new Client({ connectionString: adminUrl.toString() });

  console.log(`Creating database if needed: ${databaseName}`);

  try {
    await client.connect();
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);

    if (result.rowCount) {
      console.log('Database already exists.');
      return;
    }

    await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
    console.log('Database created.');
  } catch (err) {
    console.error('Database creation failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
