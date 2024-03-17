'use strict';

class AudioQueue {
  constructor(options, dispatchTarget, sounds) {
    this.options = options;
    this.dispatchTarget = dispatchTarget;
    this.sounds = sounds;
    this.queue = [];
  }

  next = async () => {
    if (this.queue.length === 0) return;
    const first = this.queue[0];
    if (typeof first.play === 'function') {
      try {
        await first.play();
      } catch (error) {
        // Chrome does not allow autoplay of sounds when a page is loaded
        // and the user has not interacted with it yet.
        // Ignore these errors.
        if (error instanceof DOMException && error.name === 'NotAllowedError') return;
        console.error('play() error', error, first, this.queue);
      }
    }
  };

  clear = (keepFirst = false) => {
    // Keep the first audio file if its playback has not finished and the game is over
    const first = this.queue[0];

    this.queue = keepFirst && first && !first.ended ? [first] : [];

    this.dispatchTarget.dispatchEvent(new CustomEvent('queueCleared'));
  };

  createQueueAudio = (file) => {
    const doEnded = () => {
      // Clear the queue if there are too many sounds queued to make sure the
      // commentator is not too far behind the game with his commentary
      if (this.queue.length > 3) {
        this.clear();
      } else {
        this.queue.shift();
        this.next();
      }
    };

    // Random error, sound not playing and queue building up (since it is
    // only cleared in the play() callback).
    // Making sure to clear it if it gets too large
    // @TODO: Figure out a better way
    if (this.queue.length > 10) {
      const duration = this.queue[0].duration;
      setTimeout(() => { this.clear(); }, duration * 1000); // Making sure sounds don't overlap
    }

    const audio = AudioUtils.create(file, this.options.commentator, this.options.volume / 100);
    audio.addEventListener('ended', doEnded, false);

    return audio;
  };

  push = (key) => {
    if (typeof key === 'undefined') { return; }
    
    let file = AudioUtils.getRandom(this.sounds, key, this.options.commentator) || AudioUtils.getGeneric(this.sounds, key, this.options.commentator);
    
    // Random chance (1/6) to play a 'fill' sound instead of nothing
    // when there is no sound for the notation
    const trueOneOutOfSix = () => !(Math.floor(Math.random() * 6));
    if (!file && trueOneOutOfSix()) {
      file = AudioUtils.getRandom(this.sounds, 'fill', this.options.commentator);
    }

    // console.log(key, file, this.queue.length);

    // If still no file to play, abort audio queue process
    if (!file) { return; }

    this.queue.push(this.createQueueAudio(file));

    if (this.queue.length === 1) { this.next(); }
  };
}
