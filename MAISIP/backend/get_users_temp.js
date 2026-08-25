const db = require('./db/db');

async function getUsers() {
    try {
        const result = await db.query('SELECT * FROM users');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error("Error fetching users:", e);
    } finally {
        process.exit();
    }
}

getUsers();
