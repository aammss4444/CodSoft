const db = require('./db/db');
(async () => {
  const result = await db.query(`SELECT email FROM users WHERE role = 'institute' LIMIT 1`);
  console.log(result.rows);
  process.exit(0);
})();
