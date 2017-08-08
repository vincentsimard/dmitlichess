const Dmitlichess = (function(chrome, sounds, MoveEmitter, GameStateEmitter) {
  'use strict';

  // @TODO: Game start/end sounds
  // @TODO: Fix castling sounds
  // @TODO: Add option to enable/disable extension for when:
  //   - playing
  //   - observing
  //   - analyzing (needs additional work...)
  // @TODO: Have fallback notation
  //   (e.g.: Nd2 for Nbd2 when Nbd2 sound doesn't exist, xf4 is Bxf4 doesn't exist, Qx if Qxh8 doesn't exist, etc.)
  // @TODO: Fix the gruntfile error about imgmin

  const Dmitlichess = {
    defaults: {
      volume: 100,          // Percentage
      miscInterval: 10000,  // Every 10 seconds
      fillInterval: 17000,  // Every 17 seconds
      longTimeout: 3600,    // Once before the 1 hour mark (random time)
      commentator: 'dmitri'
    },

    options: {},

    intervals: {
      misc: undefined,
      fill: undefined,
      long: undefined
    },

    audioQueue: [],

    makeAudio: function(file, volume) {
      let path = chrome.extension.getURL('ogg/' + this.options.commentator + '/' + file);
      let audio = new Audio(path);
      audio.volume = volume;

      return audio;
    },

    getRandomSound: function(key) {
      let files = sounds[key];

      return files && files[Math.floor(Math.random()*files.length)];
    },

    getGenericSound: function(key) {
      // Generic capture sounds
      if (key.indexOf('x') === 1) { return this.getRandomSound(key.substring(1)); }

      // Translate some game end states
      // @TODO: Individual sounds for white/black resigned?
      if (key.indexOf('white resigned') >= 0) { return this.getRandomSound('resign'); }
      if (key.indexOf('black resigned') >= 0) { return this.getRandomSound('resign'); }
      if (key.indexOf('time out') >= 0) { return this.getRandomSound('flag'); }
    },

    playNextSound: function() {
      if (this.audioQueue.length > 0) {
        this.audioQueue[0].play();
      }
    },

    resetMiscInterval: function() {
      if (!this.intervals.misc) { return; }

      clearInterval(this.intervals.misc);
      this.intervals.misc = setInterval(()=> { this.queueSound('misc'); }, this.options.miscInterval);
    },

    queueSound: function(key) {
      if (typeof key === 'undefined') { return; }

      var file = this.getRandomSound(key) || this.getGenericSound(key);
      var audio;

      console.log(key, file);

      var trueFiveOutOfSix = function() {
        return !!(Math.floor(Math.random() * 6));
      };

      var playNext = ()=> {
        this.audioQueue.shift();
        this.playNextSound();
      };

      var resetQueue = ()=> {
        this.audioQueue = [];
        this.resetMiscInterval();
      };

      var doEnded = ()=> {
        // Clear the queue if there are too many sounds queued
        // so Dmitry is not too behind the game with his commentary?
        if (this.audioQueue.length > 3) {
          resetQueue();
        } else {
          playNext();
        }
      };

      // No sound for notation :(
      if (!file) {
        // Random chance (1/6) to play a 'fill' sound instead of nothing
        // when the sound doesn't exist
        // (e.g.: dmitri's 'yes', maurice's 'uh'/'and', etc.)
        if (trueFiveOutOfSix()) { return; }
        file = this.getRandomSound('fill');
      }

      // If still no file to play, abort audio queue process (should not happen)
      if (!file) { return; }

      audio = this.makeAudio(file, this.options.volume / 100);
      audio.addEventListener('ended', doEnded, false);

      this.audioQueue.push(audio);

      if (this.audioQueue.length === 1) { this.playNextSound(); }
    },

    start: function(el) {
      // Attach event handlers
      el.addEventListener('move',    (e)=> this.queueSound(e.detail));
      el.addEventListener('capture', (e)=> this.queueSound(e.detail));
      el.addEventListener('check',   ()=> this.queueSound('check'));
      el.addEventListener('state',   (e)=> {
        this.queueSound(e.detail);

        if (this.intervals.misc) { clearInterval(this.intervals.misc); }
        if (this.intervals.fill) { clearInterval(this.intervals.fill); }
        if (this.intervals.long) { clearTimeout(this.intervals.long); }
      });

      // Play random sound bits
      this.intervals.misc = setInterval(()=> { this.queueSound('misc'); }, this.options.miscInterval);
      this.intervals.fill = setInterval(()=> { this.queueSound('fill'); }, this.options.fillInterval);
      this.intervals.long = setTimeout(()=> { this.queueSound('long'); }, (Math.floor(Math.random() * this.options.longTimeout) + 1) * 1000);
    },

    init: function() {
      let elements = {
        main:   document.querySelector('#lichess'),
        board:  document.querySelector('#lichess .lichess_board'),
        moves:  document.querySelector('#lichess .moves'),
        header: document.querySelector('#site_header')
      };

      if (!sounds) { return; }
      if (!elements.board) { return; }

      let moves = new MoveEmitter(elements.moves, elements.main);
      let gamestates = new GameStateEmitter(elements.header, elements.main);

      chrome.storage.sync.get(this.defaults, (items)=> {
        this.options = items;
        sounds = sounds[this.options.commentator];
        this.start(elements.main);
      });
    }
  };

  Dmitlichess.init();

  return {
    defaults: this.defaults,
    options: this.options,
    makeAudio: this.makeAudio,
    init: this.init
  };
})(chrome, sounds, MoveEmitter, GameStateEmitter);
