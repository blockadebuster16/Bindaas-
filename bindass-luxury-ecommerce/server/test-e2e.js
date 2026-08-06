const http = require('http');

async function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function test() {
  console.log('--- TEST RESET ---');
  const resetRes = await makeRequest('/api/auth/admin-reset', {
    predefinedEmail: 'admin@bindaas.com',
    newEmail: 'newadmin@test.com',
    newPassword: 'newpassword123'
  });
  console.log('Reset Response:', resetRes.status, resetRes.body);

  console.log('--- TEST LOGIN ---');
  const loginRes = await makeRequest('/api/auth/admin-login', {
    email: 'newadmin@test.com',
    password: 'newpassword123'
  });
  console.log('Login Response:', loginRes.status, loginRes.body);
}

test();
