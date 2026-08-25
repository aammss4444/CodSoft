const http = require('http');

const loginData = JSON.stringify({
  identifier: 'institute@example.com',
  password: 'institute123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const req = http.request(loginOptions, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Login result:', data));
});

req.write(loginData);
req.end();
