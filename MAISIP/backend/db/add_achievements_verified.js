const pool = require('./db');

async function updateSchema() {
  try {
    console.log('Adding is_verified to athlete_achievements...');
    await pool.query('ALTER TABLE athlete_achievements ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;');
    
    console.log('Adding verified_at to athlete_achievements...');
    await pool.query('ALTER TABLE athlete_achievements ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;');
    
    console.log('Schema update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update schema:', err);
    process.exit(1);
  }
}

updateSchema();
