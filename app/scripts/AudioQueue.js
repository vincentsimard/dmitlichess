const AudioQueue = (function(sounds, Utils) {
  'use strict';

  return {
    queue: [],

    options: {
      commentator: 'maurice',
      volume: 100
    },

    makeAudio: function(file = Utils.throwIfMissing, commentator = 'dmitri', volume = 1) {
      let path = chrome.extension.getURL('ogg/' + commentator + '/' + file);
      let audio = new Audio(path);
      audio.volume = volume;

      return audio;
    },

    getRandomSound: function(key = Utils.throwIfMissing) {
      let files = sounds['maurice'][key];

      return files && files[Math.floor(Math.random()*files.length)];
    },

    getGenericSound: function(key = Utils.throwIfMissing) {
      // Generic capture sounds
      if (key.indexOf('x') === 1) { return this.getRandomSound(key.substring(1)); }

      // Translate some game end states
      // @TODO: Individual sounds for white/black resigned?
      if (key.indexOf('white resigned') >= 0) { return this.getRandomSound('resign'); }
      if (key.indexOf('black resigned') >= 0) { return this.getRandomSound('resign'); }
      if (key.indexOf('time out') >= 0) { return this.getRandomSound('flag'); }
    },

    next: function() {
      if (this.queue.length > 0) {
        this.queue[0].play();
      }
    },

    clear: function() {
      this.queue = [];

      // this.resetMiscInterval(); // @TODO: Handle interval outside, trigger event
    },

    makeQueueAudio: function(file) {
      let audio;

      let doEnded = ()=> {
        // Clear the queue if there are too many sounds queued to make sure the
        // commentator is not too far behind the game with his commentary
        if (this.queue.length > 3) {
          this.clear();
        } else {
          this.queue.shift();
          this.next();
        }
      };

      audio = this.makeAudio(file, this.options.commentator, this.options.volume / 100);
      audio.addEventListener('ended', doEnded, false);

      return audio;
    },

    push: function(key = Utils.throwIfMissing) {
      if (typeof key === 'undefined') { return; }

      let file = this.getRandomSound(key) || this.getGenericSound(key);

      console.log(key, file);

      // Random chance (1/6) to play a 'fill' sound instead of nothing
      // when there is no sound for the notation
      if (!file && Utils.trueOneOutOfSix()) {
        file = this.getRandomSound('fill');
      }

      // If still no file to play, abort audio queue process
      if (!file) { return; }

      this.queue.push(this.makeQueueAudio(file));

      if (this.queue.length === 1) { this.next(); }
    }
  };
})(sounds, Utils);
