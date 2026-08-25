const db = require('./db/db');
const fs = require('fs');

async function run() {
  const sql = fs.readFileSync('schema_updates_step45.sql', 'utf8');
  try {
    await db.query(sql);
    console.log('Step 4 and 5 Schema updated successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
