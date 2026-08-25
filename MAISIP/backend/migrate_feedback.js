const pool = require('./db/db');

async function updateSchema() {
  try {
    await pool.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS admin_feedback TEXT;`);
    console.log("Successfully added admin_feedback to athletes table.");
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

updateSchema();
