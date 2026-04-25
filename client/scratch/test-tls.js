
const https = require('https');

const options = {
  hostname: 'catalog.api.gamedistribution.com',
  port: 443,
  path: '/api/v2.0/rss/All/?collection=all&amount=10&format=json',
  method: 'GET',
  headers: { 'User-Agent': 'Mozilla/5.0' },
  // Try to force TLS 1.2
  secureProtocol: 'TLSv1_2_method'
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Length:', data.length));
});

req.on('error', e => console.error('Error:', e.message));
req.end();
