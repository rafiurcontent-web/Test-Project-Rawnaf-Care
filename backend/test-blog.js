const http = require('http');

const username = 'admin_rawnaf';
const password = 'securepassword123';
let cookie = '';
let blogId = '';
let blogSlug = '';
let duplicateBlogId = '';

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
  console.log('--- Starting Blog CRUD Tests ---');

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

  // 2. Create a blog with Bengali title
  console.log('\n[TEST 2] POST /blogs (Bengali Title)');
  const blogData = {
    title: 'গর্ভাবস্থায় সঠিক পুষ্টি ও প্রয়োজনীয় যত্ন',
    content: '<p>Some content here</p>',
    excerpt: 'Excerpt here',
    featuredImage: { url: 'http://example.com/img.jpg', public_id: 'img123' },
    isPublished: true
  };
  res = await request('POST', '/blogs', blogData, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 201 && res.data.data.slug) {
    blogId = res.data.data._id;
    blogSlug = res.data.data.slug;
    console.log(`✓ Success: Blog created. Slug auto-generated as: ${blogSlug}`);
  } else {
    console.error('X Failed');
  }

  // 3. Create blog with same title
  console.log('\n[TEST 3] POST /blogs (Duplicate Title)');
  res = await request('POST', '/blogs', blogData, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 201 && res.data.data.slug) {
    duplicateBlogId = res.data.data._id;
    console.log(`✓ Success: Duplicate Blog created. Slug resolved as: ${res.data.data.slug}`);
  } else {
    console.error('X Failed');
  }

  // 4. GET /blogs (Public)
  console.log('\n[TEST 4] GET /blogs');
  res = await request('GET', '/blogs');
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && Array.isArray(res.data.data)) {
    console.log(`✓ Success: Retrieved ${res.data.data.length} published blogs`);
  } else {
    console.error('X Failed');
  }

  // 5. GET /blogs/:slug
  console.log(`\n[TEST 5] GET /blogs/${blogSlug}`);
  res = await request('GET', `/blogs/${encodeURI(blogSlug)}`);
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && res.data.data.slug === blogSlug) {
    console.log(`✓ Success: Retrieved single blog by slug`);
  } else {
    console.error('X Failed', res.data);
  }

  // 6. GET /blogs/slugs
  console.log('\n[TEST 6] GET /blogs/slugs');
  res = await request('GET', '/blogs/slugs');
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && Array.isArray(res.data.data)) {
    console.log(`✓ Success: Retrieved slugs list for sitemap`);
  } else {
    console.error('X Failed');
  }

  // 7. GET /admin/blogs
  console.log('\n[TEST 7] GET /admin/blogs');
  res = await request('GET', '/admin/blogs', null, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && Array.isArray(res.data.data)) {
    console.log(`✓ Success: Retrieved ${res.data.data.length} blogs for admin dashboard`);
  } else {
    console.error('X Failed');
  }

  // 8. PUT /blogs/:id
  console.log(`\n[TEST 8] PUT /blogs/${blogId}`);
  res = await request('PUT', `/blogs/${blogId}`, { title: 'Updated Title' }, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && res.data.data.title === 'Updated Title') {
    console.log(`✓ Success: Blog updated correctly. New slug: ${res.data.data.slug}`);
  } else {
    console.error('X Failed');
  }

  // 9. PATCH /blogs/:id/toggle-publish
  console.log(`\n[TEST 9] PATCH /blogs/${blogId}/toggle-publish`);
  res = await request('PATCH', `/blogs/${blogId}/toggle-publish`, null, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 200 && res.data.isPublished === false) {
    console.log(`✓ Success: Publish status toggled to false`);
  } else {
    console.error('X Failed');
  }

  // 10. DELETE /blogs/:id
  console.log(`\n[TEST 10] DELETE /blogs/${blogId}`);
  res = await request('DELETE', `/blogs/${blogId}`, null, { Cookie: cookie });
  console.log(`Status: ${res.status}`);
  if (res.status === 200) {
    console.log(`✓ Success: Blog deleted successfully`);
  } else {
    console.error('X Failed');
  }

  // Clean up
  console.log(`\nCleaning up duplicate blog...`);
  await request('DELETE', `/blogs/${duplicateBlogId}`, null, { Cookie: cookie });

  console.log('\n--- Blog CRUD Tests Complete ---');
};

runTests();
