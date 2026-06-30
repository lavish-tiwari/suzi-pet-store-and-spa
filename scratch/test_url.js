import https from 'https';

const buckets = [
  'suzi-pet-store-and-spa.appspot.com',
  'suzi-pet-store-and-spa.firebasestorage.app',
  'this-bucket-definitely-does-not-exist-at-all-987654321.appspot.com'
];

async function checkUploadEndpoint(bucket) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o`;
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'POST' }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Bucket: ${bucket}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (err) => {
      console.log(`Error checking ${bucket}:`, err.message);
      resolve(null);
    });

    req.end();
  });
}

async function run() {
  for (const bucket of buckets) {
    await checkUploadEndpoint(bucket);
    console.log('-------------------');
  }
}

run();
