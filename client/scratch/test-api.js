
async function test() {
  const url = 'https://catalog.api.gamedistribution.com/api/v2.0/rss/All/?collection=All&categories=All&type=all&amount=200&page=1&format=json';
  try {
    const r = await fetch(url);
    const data = await r.json();
    console.log('Is array:', Array.isArray(data));
    if (Array.isArray(data)) {
      console.log('Length:', data.length);
      console.log('Sample 1 keys:', Object.keys(data[0]));
      console.log('Sample 1 Md5:', data[0].Md5);
    } else {
      console.log('Keys:', Object.keys(data));
    }
  } catch (e) {
    console.error('Fetch failed:', e.message);
  }
}
test();
