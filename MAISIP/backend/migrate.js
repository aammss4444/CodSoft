const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function migrate() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'sports_platform',
    password: process.env.DB_PASSWORD || 'Amey@p4444',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();

    // 1. ALTER institutes table
    await client.query(`
      ALTER TABLE institutes 
      ADD COLUMN IF NOT EXISTS institute_registration_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';
    `);
    console.log("Altered institutes table.");

    // 2. ALTER athletes table
    await client.query(`
      ALTER TABLE athletes
      ADD COLUMN IF NOT EXISTS athlete_registration_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS institute_registration_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS linked_institute_id INTEGER REFERENCES institutes(id),
      ADD COLUMN IF NOT EXISTS created_by_role VARCHAR(50),
      ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER;
    `);
    console.log("Altered athletes table.");

    // 3. ALTER users table
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS linked_institute_id INTEGER REFERENCES institutes(id),
      ADD COLUMN IF NOT EXISTS linked_athlete_id INTEGER REFERENCES athletes(id);
    `);
    console.log("Altered users table.");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

migrate();
