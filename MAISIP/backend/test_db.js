const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sports_platform',
  password: 'Amey@p4444',
  port: 5432,
});

async function main() {
  try {
    const res = await pool.query("SELECT id, title, competition_name, city, verification_status, venue_name FROM achievements ORDER BY id DESC LIMIT 5");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
main();
