'use strict';

module.exports =
{
  replace: {
    myDeck: false,  // If true, replaces your deck
    theirDeck: true,  // If true, replaces their deck
    randSeed: false  // If true, replaces the RandSeed value
  },
  new: {
    theirDeck: Array(0).fill(3806), // The replacement deck for them, if replace.theirDeck is true
    myDeck: Array(10).fill(6120).concat(Array(20).fill(4766)),  // The replacement deck for you, if replace.myDeck is true
    randSeed: 13371337,  // The replacement RandSeed, if replace.randSeed is true
  },

  makeRare: true,  // If enabled, makes all of your cards prismatic
  enableAuto: true, // If enabled, enables auto-dueling for all duelists

  logging: {
    enabled: true,  // Whether or not to log server responses
    divider: '\n=======================================================\n',
    filename: 'responses.txt',
  },
};
