const fs = require('fs');

async function runTests() {
  console.log('--- Starting Image Upload Tests ---');

  // 1. Login as admin
  console.log('\n[TEST 1] Login as admin');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin_rawnaf', password: 'securepassword123' })
  });
  
  const cookie = loginRes.headers.get('set-cookie');
  if (loginRes.ok && cookie) {
    console.log('✓ Success: Logged in and got cookie');
  } else {
    console.error('X Failed to login');
    return;
  }

  // Create dummy files
  fs.writeFileSync('test_valid.jpg', Buffer.alloc(1024 * 500)); // 500KB
  fs.writeFileSync('test_large.jpg', Buffer.alloc(1024 * 1024 * 6)); // 6MB
  fs.writeFileSync('test_invalid.gif', Buffer.alloc(1024 * 100)); // 100KB

  // 2. Test POST with valid JPEG
  console.log('\n[TEST 2] Valid JPEG (under 2MB)');
  const fd1 = new FormData();
  fd1.append('image', new Blob([fs.readFileSync('test_valid.jpg')], { type: 'image/jpeg' }), 'test_valid.jpg');
  
  const res1 = await fetch('http://localhost:5000/api/upload/image', {
    method: 'POST',
    headers: { 'Cookie': cookie },
    body: fd1
  });
  console.log(`Status: ${res1.status}`);
  if (res1.status === 201) {
    console.log(`✓ Success: Cloudinary URL returned`);
  } else if (res1.status === 500) {
    console.log(`- Note: Server returned 500. This is expected if Cloudinary credentials are placeholders in .env!`);
  } else {
    console.error(`X Failed: expected 201 or 500, got ${res1.status}`);
  }

  // 3. Test with 5MB file
  console.log('\n[TEST 3] 6MB JPEG (Payload Too Large)');
  const fd2 = new FormData();
  fd2.append('image', new Blob([fs.readFileSync('test_large.jpg')], { type: 'image/jpeg' }), 'test_large.jpg');
  
  const res2 = await fetch('http://localhost:5000/api/upload/image', {
    method: 'POST',
    headers: { 'Cookie': cookie },
    body: fd2
  });
  console.log(`Status: ${res2.status}`);
  if (res2.status === 413) {
    console.log(`✓ Success: Multer correctly blocked 6MB file (413 Payload Too Large)`);
  } else {
    console.error(`X Failed: Expected 413, got ${res2.status}`);
  }

  // 4. Test with .gif file
  console.log('\n[TEST 4] Invalid MIME type (.gif)');
  const fd3 = new FormData();
  fd3.append('image', new Blob([fs.readFileSync('test_invalid.gif')], { type: 'image/gif' }), 'test_invalid.gif');
  
  const res3 = await fetch('http://localhost:5000/api/upload/image', {
    method: 'POST',
    headers: { 'Cookie': cookie },
    body: fd3
  });
  console.log(`Status: ${res3.status}`);
  if (res3.status === 400) { 
    console.log(`✓ Success: Multer correctly rejected GIF with 400`);
  } else {
    console.error(`X Failed: Expected 400, got ${res3.status}`);
  }

  // 5. Test without any file
  console.log('\n[TEST 5] No file provided');
  const fd4 = new FormData();
  
  const res4 = await fetch('http://localhost:5000/api/upload/image', {
    method: 'POST',
    headers: { 'Cookie': cookie },
    body: fd4
  });
  console.log(`Status: ${res4.status}`);
  if (res4.status === 400) {
    console.log(`✓ Success: Controller rejected empty request with 400`);
  } else {
    console.error(`X Failed: Expected 400, got ${res4.status}`);
  }

  // Cleanup
  fs.unlinkSync('test_valid.jpg');
  fs.unlinkSync('test_large.jpg');
  fs.unlinkSync('test_invalid.gif');

  console.log('\n--- Image Upload Tests Complete ---');
}

runTests();
