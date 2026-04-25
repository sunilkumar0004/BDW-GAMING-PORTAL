
const https = require('https');

function test() {
  const url = 'https://catalog.api.gamedistribution.com/api/v2.0/rss/All/?collection=All&categories=All&type=all&amount=10&page=1&format=json';
  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  }, (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Data length:', data.length);
      try {
        const json = JSON.parse(data);
        console.log('Is array:', Array.isArray(json));
      } catch (e) {
        console.log('JSON Parse Error:', e.message);
        console.log('Start of data:', data.slice(0, 100));
      }
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}
test();
