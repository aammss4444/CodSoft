const pool = require('./db');

async function updateSchema() {
  try {
    console.log('Adding age_at_achievement to achievements table...');
    await pool.query('ALTER TABLE achievements ADD COLUMN IF NOT EXISTS age_at_achievement INTEGER;');
    
    const checkRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'achievements' AND column_name = 'age_at_achievement';
    `);
    console.log('Column check result:', checkRes.rows);
    console.log('Schema update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update schema:', err);
    process.exit(1);
  }
}

updateSchema();
