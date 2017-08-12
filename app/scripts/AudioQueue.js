const AudioQueue = (function(sounds, Utils) {
  'use strict';

  return {
    options: Utils.defaults,
    elements: Utils.elements,

    queue: [],

    next: function() {
      if (this.queue.length > 0) {
        let first = this.queue[0];

        if (typeof first.play === 'function') { first.play(); }
      }
    },

    clear: function() {
      // Keep the first audio file if its playback has not finished
      let first = this.queue[0];
      this.queue = first && !first.ended ? [first] : [];

      this.elements.main.dispatchEvent(new CustomEvent('queueCleared'));
    },

    createQueueAudio: function(file) {
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

      audio = Utils.audio.create(file, this.options.commentator, this.options.volume / 100);
      audio.addEventListener('ended', doEnded, false);

      return audio;
    },

    push: function(key = Utils.throwIfMissing) {
      if (typeof key === 'undefined') { return; }

      let file = Utils.audio.getRandom(key, this.options.commentator) || Utils.audio.getGeneric(key, this.options.commentator);

      // console.log(key, file);

      // Random chance (1/6) to play a 'fill' sound instead of nothing
      // when there is no sound for the notation
      if (!file && Utils.trueOneOutOfSix()) {
        file = Utils.audio.getRandom('fill', this.options.commentator);
      }

      // If still no file to play, abort audio queue process
      if (!file) { return; }

      this.queue.push(this.createQueueAudio(file));

      if (this.queue.length === 1) { this.next(); }
    }
  };
})(sounds, Utils);
