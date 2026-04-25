
const https = require('https');

const options = {
  hostname: '52.30.53.241', // Direct IP
  port: 443,
  path: '/api/v2.0/rss/All/?collection=all&amount=100&format=json',
  method: 'GET',
  headers: { 
    'User-Agent': 'Mozilla/5.0',
    'Host': 'catalog.api.gamedistribution.com' // Crucial
  },
  rejectUnauthorized: false // Since the cert is for the hostname, not the IP
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Success! Games found:', json.length);
    } catch (e) {
      console.log('JSON Parse Error. Data length:', data.length);
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.end();
