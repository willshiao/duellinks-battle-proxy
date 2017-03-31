'use strict';

const fs = require('fs');
const Proxy = require('http-mitm-proxy');
const proxy = Proxy();

const ext = {
  cardMap: require('./cardmap'),
  config: require('./config'),
};

[['config'], ['cardmap', 'cardMap']].forEach((val) => {
  const fileName = val[0];
  const varName = val[1] || val[0];

  fs.watchFile(`./${fileName}.js`, (curr, prev) => {
    if(curr.mtime == prev.mtime) return;  // Do nothing if file was not modified
    delete require.cache[require.resolve(`./${fileName}`)];  // Clear cached require entry
    ext[varName] = require(`./${fileName}`);  // Reload config
    console.log(`${fileName}.js modified, reloading file...`);
  });
});

proxy.onRequest(function(ctx, callback) {
  if (ctx.clientToProxyRequest.headers.host == 'att-jpb.mo.konami.net') {
    const chunks = [];
    ctx.use(Proxy.gunzip);

    ctx.onResponseData((ctx, chunk, callback) => {
      chunks.push(chunk);
      return callback(null, null);
    });

    ctx.onResponseEnd((ctx, callback) => {
      const body = parseRequest(Buffer.concat(chunks));
      ctx.proxyToClientResponse.write(body);
      if(ext.config.logging.enabled) {
        fs.appendFile(ext.config.logging.filename, body.toString() + ext.config.logging.divider, () => {
          return callback();
        });
      } else {
        return callback();
      }
    });
  }
  return callback();
});

proxy.listen({port: 8000}, () => {
  console.log('Listening on port 8000.');
});

function parseRequest(chunk) {
  let req = chunk.toString();
  try {
    if(req.charAt(0) == '@') req = req.slice(1);  // Remove '@'
    // Parse JSON
    let data = JSON.parse(req);
    data = editRequest(data);
    req = '@' + JSON.stringify(data);
  } catch(e) {
    if(e.name == 'TypeError')
      console.error('Invalid JSON.');
    else
      console.log('Unknown error:', e);
    return chunk;
  }
  return req;
}

function editRequest(data) {
  if(!data.res || !data.res[0] || !data.res[0][1] || !data.res[0][1].Duel)
    return data;
  const myDeck = data.res[0][1].Duel.Deck[0];
  const theirDeck = data.res[0][1].Duel.Deck[1];

  console.log('Found battle.');
  console.log('Random Seed (original):', data.res[0][1].Duel.RandSeed);
  console.log('Their deck (original):', prettyDeck(theirDeck.Main.CardIds));
  console.log('My deck:', prettyDeck(myDeck.Main.CardIds));

  if(ext.config.replace.theirDeck) {
    theirDeck.Main.CardIds = ext.config.new.theirDeck;
    theirDeck.Main.Rare = Array(theirDeck.Main.CardIds.length).fill(1);
  }

  if(ext.config.replace.myDeck) {
    myDeck.Main.CardIds = ext.config.new.myDeck;
    myDeck.Main.Rare = Array(myDeck.Main.CardIds.length).fill(1);
  }

  if(ext.config.enableAuto) {
    data.res[0][1].Duel.auto = 1;
  }

  if(ext.config.makeRare) {
    // Make all my cards rare
    myDeck.Main.Rare = myDeck.Main.Rare.map(c => 3);
  }

  if(ext.config.replace.randSeed) {
    data.res[0][1].Duel.RandSeed = ext.config.new.randSeed;
  }

  console.log('New Random Seed:', data.res[0][1].Duel.RandSeed);
  console.log('My new deck:', prettyDeck(myDeck.Main.CardIds));
  console.log('Their new deck:', prettyDeck(theirDeck.Main.CardIds));
  console.log('========================================');

  data.res[0][1].Duel.Deck[0] = myDeck;
  data.res[0][1].Duel.Deck[1] = theirDeck;

  return data;
}

function prettyDeck(deckIds) {
  return deckIds.map(id => {
    if(id in ext.cardMap)
      return ext.cardMap[id] + ` (${id})`;
    return id;
  });
}
