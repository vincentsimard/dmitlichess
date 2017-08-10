const Utils = (function(chrome, sounds) {
  'use strict';

  let defaults = {
    volume: 100,          // Percentage
    miscInterval: 10000,  // Every 10 seconds
    fillInterval: 17000,  // Every 17 seconds
    longTimeout: 3600,    // Once before the 1 hour mark (random time)
    commentator: 'dmitri'
  };

  return {
    defaults: defaults,

    throwIfMissing: ()=> { throw new Error('Missing parameter'); },

    trueOneOutOfSix: ()=> !(Math.floor(Math.random() * 6)),

    audio: {
      create: function(file = this.throwIfMissing, commentator = defaults.commentator, volume = defaults.volume) {
        let path = chrome.extension.getURL('ogg/' + commentator + '/' + file);
        let audio = new Audio(path);
        audio.volume = volume;

        return audio;
      },

      getRandom: function(key = this.throwIfMissing, commentator = defaults.commentator) {
        if (!sounds) { return; }

        let files = sounds[commentator][key];

        return files && files[Math.floor(Math.random()*files.length)];
      },

      getGeneric: function(key = this.throwIfMissing, commentator = defaults.commentator) {
        // Generic capture sounds. e.g.: use xf7 if Nxf7 sound doesn't exist
        if (key.indexOf('x') === 1) { return this.getRandom(key.substring(1), commentator); }

        // @TODO: Also handle other fallback notation:
        //   - Nd2 if Nbd2 sound doesn't exist
        //   - Bx if Bxf4 doesn't exist
        //   - h1 if Kh1 doesn't exist

        // Translate some game end states
        // @TODO: Individual sounds for white/black resigned?
        if (key.indexOf('white resigned') >= 0) { return this.getRandom('resign', commentator); }
        if (key.indexOf('black resigned') >= 0) { return this.getRandom('resign', commentator); }
        if (key.indexOf('time out') >= 0) { return this.getRandom('flag', commentator); }
      }
    }
  };
})(chrome, sounds);
