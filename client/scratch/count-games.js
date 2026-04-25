
const fs = require('fs');
const games = JSON.parse(fs.readFileSync('c:/Users/NELAESH/OneDrive/Desktop/BDW/poki-clone/client/custom-games.json', 'utf-8'));
console.log('Count:', games.length);
