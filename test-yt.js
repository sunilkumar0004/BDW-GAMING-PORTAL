const https = require('https');
function search(q) {
  return new Promise(resolve => {
    https.get('https://www.youtube.com/results?search_query=' + q.replace(/ /g, '+'), res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let matches = [];
        let re = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
        let match;
        while ((match = re.exec(data)) !== null) {
            matches.push(match[1]);
        }
        resolve([...new Set(matches)].slice(0, 5));
      });
    });
  });
}
async function run() {
  console.log('bgmi', await search('battlegrounds mobile india launch trailer'));
  console.log('free-fire', await search('garena free fire official trailer max'));
  console.log('cod-mobile', await search('call of duty mobile official cinematic trailer'));
  console.log('pubg-mobile', await search('pubg mobile official trailer'));
}
run();
