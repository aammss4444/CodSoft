const http = require('http');

const loginData = JSON.stringify({
  email: 'admin@example.com',
  password: 'admin123'
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
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    console.log('Login token:', data.accessToken ? 'Present' : 'Missing');
    
    if (data.accessToken) {
      const getOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.accessToken}`
        }
      };
      const req2 = http.request(getOptions, res2 => {
        console.log(`GET /api/users STATUS: ${res2.statusCode}`);
        let b = '';
        res2.on('data', d => b+=d);
        res2.on('end', () => console.log('Response:', b));
      });
      req2.end();
    } else {
      console.log('Login failed:', data);
    }
  });
});

req.write(loginData);
req.end();
