const http = require('http');

const data = JSON.stringify({
  predefinedEmail: 'admin@bindaas.com ', // with trailing space!
  newEmail: 'parthmanjrekar12@gmail.com',
  newPassword: 'secretadmin123'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/admin-reset',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => { console.log('Status:', res.statusCode); console.log('Body:', responseData); });
});

req.on('error', (error) => { console.error(error); });
req.write(data);
req.end();
