const https = require('https');
const fs = require('fs');

async function getPlayStoreIcon(appId) {
  return new Promise((resolve) => {
    https.get('https://play.google.com/store/apps/details?id=' + appId + '&hl=en&gl=US', res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const match = data.match(/<img[^>]+src=\"(https:\/\/play-lh\.googleusercontent\.com\/[^\"\?]+)\"/);
        if (match) {
           resolve(match[1] + '=s512-rw');
        } else {
           resolve(null);
        }
      });
    });
  });
}

const apps = {
  'lol-wild-rift': 'com.riotgames.league.wildrift',
  'stumble-guys': 'com.games.stumbleguys',
  'asphalt-9': 'com.gameloft.android.ANMP.GloftA9HM',
  'mobile-legends': 'com.mobile.legends',
  'candy-crush-saga': 'com.king.candycrushsaga',
  'ea-fc-mobile': 'com.ea.game.fifa14_row',
  'real-cricket-24': 'com.nautilus.realcricket3d',
  'shadow-fight-4': 'com.nekki.shadowfight4',
  '1v1-lol': 'com.justbuild.simulator',
  'agar-io': 'com.miniclip.agar.io',
  'slither-io': 'air.com.hypah.io.slither',
  'paper-io-2': 'io.voodoo.paper2',
  '2048': 'com.androbaby.game2048',
  'krunker-io': 'ch.yendis.krunkerhub'
};

async function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, res => {
      if(res.statusCode !== 200) { resolve(false); return; }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    });
  });
}

async function run() {
  for (const [gameId, appId] of Object.entries(apps)) {
    console.log('Fetching Google Play icon for', gameId);
    let url = await getPlayStoreIcon(appId);
    if (!url) {
      console.log('Failed to find icon for', gameId, 'using placeholder...');
      url = `https://ui-avatars.com/api/?name=${gameId.replace(/-/g, '+')}&size=512&background=1e1e2e&color=fff`;
    }
    await downloadImage(url, 'c:/Users/NELAESH/OneDrive/Desktop/BDW/poki-clone/client/public/games/' + gameId + '.png');
    console.log('Saved', gameId + '.png');
  }
}

run();
