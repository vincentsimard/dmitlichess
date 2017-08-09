const Utils = (function() {
  'use strict';

  return {
    defaults: {
      volume: 100,          // Percentage
      miscInterval: 10000,  // Every 10 seconds
      fillInterval: 17000,  // Every 17 seconds
      longTimeout: 3600,    // Once before the 1 hour mark (random time)
      commentator: 'dmitri'
    },
    throwIfMissing: ()=> { throw new Error('Missing parameter'); },
    trueOneOutOfSix: ()=> !(Math.floor(Math.random() * 6))
  };
})();
