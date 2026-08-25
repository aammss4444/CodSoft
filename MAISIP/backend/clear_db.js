const pool = require('./db/db');

async function clearDB() {
  try {
    console.log("Clearing athletes...");
    await pool.query('TRUNCATE TABLE athletes CASCADE');
    
    console.log("Clearing institutes...");
    await pool.query('TRUNCATE TABLE institutes CASCADE');
    
    console.log("Clearing non-admin users...");
    await pool.query("DELETE FROM users WHERE username != 'admin'");

    console.log("Database cleared successfully. Only admin account remains.");
  } catch (err) {
    console.error('Failed to clear db:', err);
  } finally {
    process.exit(0);
  }
}

clearDB();
