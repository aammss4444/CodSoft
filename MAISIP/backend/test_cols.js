const db = require('./db/db');
(async () => {
  const result = await db.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('achievements', 'achievement_documents', 'athletes')
  `);
  console.log(result.rows);
  process.exit(0);
})();
