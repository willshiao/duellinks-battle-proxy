'use strict';

const fs = require('fs');
const Proxy = require('http-mitm-proxy');
const proxy = Proxy();

const cardMap = require('./cardmap');

const REPLACE_THEIR_DECK = true;
const theirReplacementDeck = [];

const REPLACE_MY_DECK = false;
const myReplacementDeck = [];

const MAKE_RARE = true;

const ENABLE_LOGGING = true;
const DIVIDER_STRING = '\n=======================================================\n';
const LOG_FILE = 'responses.txt';

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
      if(ENABLE_LOGGING) {
        fs.appendFile(LOG_FILE, body.toString() + DIVIDER_STRING, () => {
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
  console.log('Their deck (original):', prettyDeck(theirDeck.Main.CardIds));
  console.log('My deck:', prettyDeck(myDeck.Main.CardIds));

  if(REPLACE_THEIR_DECK) {
    theirDeck.Main.CardIds = theirReplacementDeck;
    theirDeck.Main.Rare = Array(theirDeck.Main.CardIds.length).fill(1);
  }

  if(REPLACE_MY_DECK) {
    myDeck.Main.CardIds = myReplacementDeck;
    myDeck.Main.Rare = Array(myDeck.Main.CardIds.length).fill(1);
  }

  if(MAKE_RARE) {
    // Make all my cards rare
    myDeck.Main.Rare = myDeck.Main.Rare.map(c => 2);
  }

  console.log('My new deck:', prettyDeck(myDeck.Main.CardIds));
  console.log('Their new deck:', prettyDeck(theirDeck.Main.CardIds));
  console.log('========================================');

  data.res[0][1].Duel.Deck[0] = myDeck;
  data.res[0][1].Duel.Deck[1] = theirDeck;

  return data;
}

function prettyDeck(deckIds) {
  return deckIds.map(id => {
    if(id in cardMap)
      return cardMap[id] + ` (${id})`;
    return id;
  });
}
