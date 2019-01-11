const Utils = (function(browser, sounds) {
  'use strict';

  const defaults = {
    volume: 100,          // Percentage
    miscInterval: 10000,  // Every 10 seconds
    fillInterval: 17000,  // Every 17 seconds
    longTimeout: 3600,    // Once before the 1 hour mark (random time)
    commentator: 'dmitri',
    enabled: true
  };

  let elements = {
    main:   document.querySelector('#lichess'),
    board:  document.querySelector('#lichess .lichess_board'),
    moves:  document.querySelector('#lichess .moves'),
    header: document.querySelector('#site_header')
  };

  const getStatusElement = ()=> document.querySelector('#site_header .status, #lichess .lichess_ground .status');

  return {
    defaults: defaults,
    elements: elements,

    getElements: function() {
      this.elements = {
        main:   document.querySelector('#lichess'),
        board:  document.querySelector('#lichess .lichess_board'),
        moves:  document.querySelector('#lichess .moves'),
        header: document.querySelector('#site_header')
      };

      return this.elements;
    },

    throwIfMissing: ()=> { throw new Error('Missing parameter'); },

    trueOneOutOfSix: ()=> !(Math.floor(Math.random() * 6)),

    isGameStart: ()=> elements.moves && elements.moves.children.length === 0,
    isGameOver: ()=> !!getStatusElement(),

    sendSaveMessage: ()=> {
      browser.tabs.query({currentWindow: true, active: true}).then(function (tabs){
        browser.tabs.sendMessage(tabs[0].id, { 'message': 'optionsSaved' });
      });
    },

    audio: {
      create: function(file = this.throwIfMissing, commentator = defaults.commentator, volume = defaults.volume) {
        const path = browser.extension.getURL('ogg/' + commentator + '/' + file);
        const audio = new Audio(path);
        audio.volume = volume;

        return audio;
      },

      getRandom: function(key = this.throwIfMissing, commentator = defaults.commentator) {
        if (!sounds) { return; }

        const files = sounds[commentator][key];

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
        /*
        if (key.indexOf('white resigned') >= 0) { return this.getRandom('resign', commentator); }
        if (key.indexOf('black resigned') >= 0) { return this.getRandom('resign', commentator); }
        */
        if (key.indexOf('resigned') >= 0) { return this.getRandom('resign', commentator); }
        if (key.indexOf('time out') >= 0) { return this.getRandom('flag', commentator); }
      },

      play: function(key, commentator = this.defaults.commentator, volume = this.defaults.volume, isRandom = true) {
        let audio;
        const file = isRandom ? this.getRandom(key, commentator) : key;

        // No sound for the notation :(
        if (!file) { return; }

        audio = this.create(file, commentator, volume / 100);
        audio.play();
      }
    },

    mutation: {
      hasAddedNodes: function(mutation = this.throwIfMissing, className = undefined) {
        return mutation.addedNodes.length > 0 && (typeof className === 'undefined' || mutation.addedNodes[0].classList.contains(className));
      }
    }
  };
})(browser, sounds);
