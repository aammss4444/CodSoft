const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db/db');
const jwt = require('jsonwebtoken');
const http = require('http');

async function test() {
  const userRes = await db.query("SELECT u.id, u.role, a.id as athlete_id FROM users u JOIN athletes a ON u.id = a.user_id WHERE u.username = 'arjun_bhosale'");
  const user = userRes.rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret');

  const achs = await db.query("SELECT id, title FROM achievements WHERE athlete_id = $1 ORDER BY achievement_date DESC", [user.athlete_id]);
  console.log(`Found ${achs.rows.length} achievements for arjun_bhosale.`);

  for (const ach of achs.rows) {
    await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/athletes/me/achievements/${ach.id}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const json = JSON.parse(body);
          console.log(`Status for [${ach.title.slice(0, 35)}...]:`, res.statusCode, 'Success:', json.success, 'Docs:', (json.documents || []).length);
          resolve();
        });
      });
      req.on('error', reject);
      req.end();
    });
  }
}

test().then(() => process.exit(0)).catch(e => { console.error('Test error:', e); process.exit(1); });
