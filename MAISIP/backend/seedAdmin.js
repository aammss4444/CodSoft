const bcrypt = require('bcryptjs');
const db = require('./db/db');

async function seed() {
  let client;
  try {
    client = await db.getClient();
    await client.query('BEGIN');

    // Insert Role
    const roleRes = await client.query(
      `INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      ['System Administrator', 'Full access to all system features']
    );
    const roleId = roleRes.rows[0].id;

    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Insert Admin User
    await client.query(
      `INSERT INTO users (username, email, password_hash, role_id, first_name, last_name, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', 'admin@maisip.in', passwordHash, roleId, 'System', 'Admin', 'active']
    );

    await client.query('COMMIT');
    console.log('Successfully seeded System Administrator account (admin / admin123)');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Seeding error:', error);
  } finally {
    if (client) client.release();
    process.exit(0);
  }
}

seed();
