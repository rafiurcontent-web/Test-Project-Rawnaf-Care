const http = require('http');

const username = 'admin_rawnaf';
const password = 'securepassword123';
let cookie = '';
const createdIds = { blogs: [], videos: [] };

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
  console.log('--- Starting Admin Dashboard Stats Tests ---');

  // 1. Login
  const loginRes = await request('POST', '/auth/login', { username, password });
  if (loginRes.status === 200 && loginRes.headers['set-cookie']) {
    cookie = loginRes.headers['set-cookie'][0].split(';')[0];
    console.log('✓ Success: Logged in as admin');
  } else {
    console.error('X Failed to login');
    return;
  }

  // 2. Create 3 blogs (2 published, 1 draft)
  console.log('\n[TEST] Creating 3 Blogs (2 Published, 1 Draft)');
  const b1 = await request('POST', '/blogs', { title: 'Stats Blog 1', content: '...', isPublished: true }, { Cookie: cookie });
  const b2 = await request('POST', '/blogs', { title: 'Stats Blog 2', content: '...', isPublished: true }, { Cookie: cookie });
  const b3 = await request('POST', '/blogs', { title: 'Stats Blog 3', content: '...', isPublished: false }, { Cookie: cookie });
  
  if (b1.data.data && b2.data.data && b3.data.data) {
    createdIds.blogs.push(b1.data.data._id, b2.data.data._id, b3.data.data._id);
    console.log('✓ Success: Blogs created');
  } else {
    console.error('X Failed to create blogs:', b1.data, b2.data, b3.data);
  }

  // 3. Create 2 videos (1 published, 1 draft)
  console.log('\n[TEST] Creating 2 Videos (1 Published, 1 Draft)');
  const v1 = await request('POST', '/videos', { title: 'Stats Video 1', youtubeUrl: 'https://youtube.com/watch?v=11111111111', isPublished: true }, { Cookie: cookie });
  const v2 = await request('POST', '/videos', { title: 'Stats Video 2', youtubeUrl: 'https://youtube.com/watch?v=22222222222', isPublished: false }, { Cookie: cookie });
  
  if (v1.data.data && v2.data.data) {
    createdIds.videos.push(v1.data.data._id, v2.data.data._id);
    console.log('✓ Success: Videos created');
  } else {
    console.error('X Failed to create videos');
  }

  // 4. Test GET /admin/stats
  console.log('\n[TEST] GET /admin/stats');
  const statsRes = await request('GET', '/admin/stats', null, { Cookie: cookie });
  console.log(`Status: ${statsRes.status}`);
  console.log(`Data:`, JSON.stringify(statsRes.data.data, null, 2));

  const stats = statsRes.data.data;
  if (
    stats.blogs.totalBlogs === 3 &&
    stats.blogs.publishedBlogs === 2 &&
    stats.blogs.draftBlogs === 1 &&
    stats.videos.totalVideos === 2 &&
    stats.videos.publishedVideos === 1 &&
    stats.videos.draftVideos === 1
  ) {
    console.log('✓ Success: Admin stats perfectly match expected counts!');
  } else {
    console.error('X Failed: Stats mismatch');
  }

  // Cleanup
  console.log('\n[TEST] Cleaning up test data...');
  for (const id of createdIds.blogs) {
    await request('DELETE', `/blogs/${id}`, null, { Cookie: cookie });
  }
  for (const id of createdIds.videos) {
    await request('DELETE', `/videos/${id}`, null, { Cookie: cookie });
  }
  console.log('✓ Success: Cleaned up');

  console.log('\n--- Stats Tests Complete ---');
};

runTests();
