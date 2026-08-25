const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db/db');
const jwt = require('jsonwebtoken');
const http = require('http');

async function test() {
  const userRes = await db.query("SELECT id, role FROM users WHERE username = 'arjun_bhosale'");
  if (userRes.rows.length === 0) throw new Error('User not found');
  const user = userRes.rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret');

  console.log('✅ Generated JWT for arjun_bhosale');

  // Test GET /api/athletes/me/achievements
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/athletes/me/achievements',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const json = JSON.parse(body);
      console.log('Status code:', res.statusCode);
      console.log('Success:', json.success);
      console.log('Achievements Count:', (json.achievements || []).length);
      (json.achievements || []).forEach((a, i) => {
        console.log(`  ${i + 1}. [${a.achievement_date?.slice(0, 10)}] ${a.title} - Status: ${a.verification_status}`);
      });
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
    process.exit(1);
  });

  req.end();
}

test();
