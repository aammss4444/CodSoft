const bcrypt = require('bcryptjs');
const db = require('./db/db');

async function resetPasswords() {
    try {
        const users = await db.query('SELECT id, username FROM users');
        
        for (let user of users.rows) {
            let password = 'password123';
            if (user.username === 'admin') {
                password = 'admin123';
            }
            const passwordHash = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);
            console.log(`Reset password for user ${user.username} to: ${password}`);
        }
        
    } catch (e) {
        console.error("Error resetting passwords:", e);
    } finally {
        process.exit();
    }
}

resetPasswords();
