const db = require('./db/db');
async function run() {
  await db.query("UPDATE achievements SET category = 'medal' WHERE title ILIKE '%Gold Medal%'");
  console.log('Updated');
  process.exit(0);
}
run();
