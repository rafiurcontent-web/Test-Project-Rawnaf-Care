const http = require('http');

const username = 'admin_rawnaf';
const password = 'securepassword123';
let cookie = '';
let videoId = '';

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

const runTests = async () => {
  console.log('--- Starting Video CRUD Tests ---');

  // 1. Login as admin
  console.log('\n[TEST 1] Login as admin');
  let res = await request('POST', '/auth/login', { username, password });
  if (res.status === 200 && res.headers['set-cookie']) {
    cookie = res.headers['set-cookie'][0].split(';')[0];
    console.log('✓ Success: Logged in and got cookie');
  } else {
    console.error('X Failed to login');
    return;
  }

  // 2. Create a video
  console.log('\n[TEST 2] POST /videos (Extract YouTube Info)');
  const videoData = {
    title: 'Test YouTube Video',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isPublished: true
  };
  res = await request('POST', '/videos', videoData, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 201 && res.data.data.videoId === 'dQw4w9WgXcQ') {
    videoId = res.data.data._id;
    console.log(`✓ Success: Video created. Extracted ID: ${res.data.data.videoId}, Thumbnail: ${res.data.data.thumbnailUrl}`);
  } else {
    console.error('X Failed', res.data);
  }

  // 3. Create same video (Duplicate check)
  console.log('\n[TEST 3] POST /videos (Duplicate Check)');
  res = await request('POST', '/videos', videoData, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 409) {
    console.log(`✓ Success: Correctly rejected duplicate videoId with 409 Conflict`);
  } else {
    console.error(`X Failed: Expected 409, got ${res.status}`);
  }

  // 4. GET /videos (Public)
  console.log('\n[TEST 4] GET /videos');
  res = await request('GET', '/videos');
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && Array.isArray(res.data.data)) {
    console.log(`✓ Success: Retrieved ${res.data.data.length} published videos`);
  } else {
    console.error('X Failed');
  }

  // 5. GET /videos/:id
  console.log(`\n[TEST 5] GET /videos/${videoId}`);
  res = await request('GET', `/videos/${videoId}`);
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && res.data.data._id === videoId) {
    console.log(`✓ Success: Retrieved single video`);
  } else {
    console.error('X Failed');
  }

  // 6. GET /admin/videos
  console.log('\n[TEST 6] GET /admin/videos');
  res = await request('GET', '/admin/videos', null, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && Array.isArray(res.data.data)) {
    console.log(`✓ Success: Retrieved ${res.data.data.length} videos for admin dashboard`);
  } else {
    console.error('X Failed');
  }

  // 7. PUT /videos/:id
  console.log(`\n[TEST 7] PUT /videos/${videoId}`);
  res = await request('PUT', `/videos/${videoId}`, { title: 'Updated Video Title' }, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && res.data.data.title === 'Updated Video Title') {
    console.log(`✓ Success: Video updated correctly`);
  } else {
    console.error('X Failed');
  }

  // 8. PATCH /videos/:id/toggle-publish
  console.log(`\n[TEST 8] PATCH /videos/${videoId}/toggle-publish`);
  res = await request('PATCH', `/videos/${videoId}/toggle-publish`, null, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && res.data.isPublished === false) {
    console.log(`✓ Success: Publish status toggled to false`);
  } else {
    console.error('X Failed');
  }

  // 9. DELETE /videos/:id
  console.log(`\n[TEST 9] DELETE /videos/${videoId}`);
  res = await request('DELETE', `/videos/${videoId}`, null, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 200) {
    console.log(`✓ Success: Video deleted successfully`);
  } else {
    console.error('X Failed');
  }

  console.log('\n--- Video CRUD Tests Complete ---');
};

runTests();
