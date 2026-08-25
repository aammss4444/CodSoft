const http = require('http');

const data = JSON.stringify({
  status: 'Approved',
  comments: 'ok',
  checklist: [],
  method: 'Manual',
  verifierName: 'System Admin',
  verifierUserId: 'admin',
  designation: 'Admin',
  organization: 'System',
  lockAfterApproval: true
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/verification/achievements/4/status',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // We don't have a valid token here, but the route requires it.
    // I need to generate a token or mock it.
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
