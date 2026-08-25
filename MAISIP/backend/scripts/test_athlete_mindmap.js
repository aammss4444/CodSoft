const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db/db');
const jwt = require('jsonwebtoken');
const http = require('http');

async function test() {
  const userRes = await db.query("SELECT id, role FROM users WHERE username = 'arjun_bhosale'");
  const user = userRes.rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your-default-jwt-secret-key-change-it');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/athletes/me/mindmap',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('Success:', json.success);
        console.log('Athlete:', json.data?.athlete?.name);
        console.log('Achievements in mindmap:', json.data?.achievements?.length);
      } catch (e) {
        console.log('Raw output:', data.slice(0, 300));
      }
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
