const db = require('./db/db');

async function testUsersQuery() {
  try {
    const result = await db.query(
      `SELECT * FROM users LIMIT 1;`
    );
    console.log("Success! Columns:", Object.keys(result.rows[0]));
  } catch (error) {
    console.error("Query failed:", error.message);
  } finally {
    process.exit();
  }
}

testUsersQuery();
