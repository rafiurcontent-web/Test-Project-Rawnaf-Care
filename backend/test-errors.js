const http = require('http');

const username = 'admin_rawnaf';
const password = 'securepassword123';
let cookie = '';

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
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

const verifyFormat = (res, expectedStatus) => {
  const { data, status } = res;
  if (status !== expectedStatus) {
    console.error(`X Failed: Expected status ${expectedStatus}, got ${status}`);
    return false;
  }
  if (data.success !== false) {
    console.error(`X Failed: Expected success: false, got ${data.success}`);
    return false;
  }
  if (!data.error) {
    console.error(`X Failed: Missing 'error' field`);
    return false;
  }
  if (!data.message) {
    console.error(`X Failed: Missing 'message' field`);
    return false;
  }
  if (!data.stack) {
    console.error(`X Failed: Missing 'stack' trace in development mode`);
    return false;
  }
  return true;
};

const runTests = async () => {
  console.log('--- Starting Error Handling Tests ---');

  // 1. Login
  const loginRes = await request('POST', '/auth/login', { username, password });
  if (loginRes.status === 200 && loginRes.headers['set-cookie']) {
    cookie = loginRes.headers['set-cookie'][0].split(';')[0];
  }

  // 1. GET /api/blogs/invalidslug123
  console.log('\n[TEST 1] GET /blogs/invalidslug123 (404 Not Found)');
  let res = await request('GET', '/blogs/invalidslug123');
  if (verifyFormat(res, 404)) {
    console.log(`✓ Success: 404 Error perfectly formatted (${res.data.error}: ${res.data.message})`);
  }

  // 2. PUT /api/blogs/invalidObjectId
  console.log('\n[TEST 2] PUT /blogs/invalidObjectId (400 CastError)');
  res = await request('PUT', '/blogs/invalidObjectId', { title: 'Test' }, { Cookie: cookie });
  if (verifyFormat(res, 400) && res.data.message === 'Invalid resource ID format') {
    console.log(`✓ Success: Mongoose CastError caught and formatted`);
  }

  // 3. POST /api/blogs with empty title
  console.log('\n[TEST 3] POST /blogs with empty title (400 ValidationError)');
  res = await request('POST', '/blogs', { title: '', content: 'Test' }, { Cookie: cookie });
  if (verifyFormat(res, 400) && res.data.error === 'ValidationError') {
    console.log(`✓ Success: Mongoose ValidationError caught and formatted (${res.data.message})`);
  }

  // 4. Access admin routes without login
  console.log('\n[TEST 4] GET /admin/blogs without login (401 Unauthorized)');
  res = await request('GET', '/admin/blogs');
  if (verifyFormat(res, 401)) {
    console.log(`✓ Success: JWT Auth Middleware caught missing token (${res.data.message})`);
  }

  // 5. POST /api/videos with invalid YouTube URL
  console.log('\n[TEST 5] POST /videos with invalid YouTube URL (400 ValidationError)');
  res = await request('POST', '/videos', { title: 'Test', youtubeUrl: 'https://vimeo.com/123' }, { Cookie: cookie });
  if (verifyFormat(res, 400)) {
    console.log(`✓ Success: Regex validator rejected non-YouTube URL (${res.data.message})`);
  }

  console.log('\n--- Error Handling Tests Complete ---');
};

runTests();
