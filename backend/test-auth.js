const http = require('http');

const baseURL = 'http://localhost:5000/api/auth';
const username = 'admin_rawnaf';
const password = 'securepassword123';
const wrongPassword = 'wrongpassword123';

let cookie = '';

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/auth${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- Starting Auth Flow Tests ---');

  // 1. Login with correct credentials
  console.log('\n[TEST 1] POST /login (Correct credentials)');
  let res = await request('POST', '/login', { username, password });
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, res.data);
  if (res.status === 200 && res.headers['set-cookie']) {
    cookie = res.headers['set-cookie'][0].split(';')[0];
    console.log(`✓ Success: Logged in and cookie received: ${cookie}`);
  } else {
    console.error('X Failed');
  }

  // 2. Test GET /me with cookie
  console.log('\n[TEST 2] GET /me (With Cookie)');
  res = await request('GET', '/me', null, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, res.data);
  if (res.status === 200 && res.data.admin) {
    console.log(`✓ Success: Admin data retrieved`);
  } else {
    console.error('X Failed');
  }

  // 3. Test POST /logout
  console.log('\n[TEST 3] POST /logout');
  res = await request('POST', '/logout', null, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, res.data);
  if (res.status === 200 && res.headers['set-cookie']) {
    console.log(`✓ Success: Logged out and cookie cleared`);
  } else {
    console.error('X Failed');
  }

  // 4. Test GET /me without cookie
  console.log('\n[TEST 4] GET /me (Without Cookie)');
  res = await request('GET', '/me');
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, res.data);
  if (res.status === 401) {
    console.log(`✓ Success: Unauthorized response correctly returned`);
  } else {
    console.error('X Failed');
  }

  // 5. Test Rate Limiter (6 wrong attempts)
  console.log('\n[TEST 5] Rate Limiter Test (6 failed login attempts)');
  for (let i = 1; i <= 6; i++) {
    res = await request('POST', '/login', { username, password: wrongPassword });
    console.log(`Attempt ${i} Status: ${res.status}`);
    if (i === 6) {
      if (res.status === 429) {
        console.log(`✓ Success: Rate limiter kicked in at attempt 6 with 429 status`);
      } else {
        console.error(`X Failed: Expected 429, got ${res.status}`);
      }
    }
  }

  console.log('\n--- Auth Flow Tests Complete ---');
};

runTests();
