'use strict';

module.exports =
{
  replace: {
    myDeck: true,  // If true, replaces your deck
    theirDeck: true,  // If true, replaces their deck
    randSeed: true  // If true, replaces the RandSeed value
  },
  new: {
    theirDeck: [],  // The replacement deck for them, if replace.theirDeck is true
    myDeck: [],  // The replacement deck for you, if replace.myDeck is true
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
