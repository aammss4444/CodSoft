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
    const res = await pool.query(
      `UPDATE achievements 
       SET verification_status = $1::varchar, 
           verified_at = CASE WHEN $1::varchar IN ('Approved', 'Verified & Locked', 'Digitally Signed') THEN CURRENT_TIMESTAMP ELSE verified_at END,
           verified_by = CASE WHEN $1::varchar IN ('Approved', 'Verified & Locked', 'Digitally Signed') THEN $2 ELSE verified_by END,
           rejection_reason = CASE WHEN $1::varchar IN ('Rejected', 'Correction Required') THEN $3 ELSE rejection_reason END
       WHERE id = $4 RETURNING *`,
      ['Verified & Locked', 1, 'ok', 4]
    );
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}
main();
