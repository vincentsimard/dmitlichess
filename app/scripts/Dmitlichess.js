(function(chrome, sounds, Utils, AudioQueue, MoveEmitter, GameStateEmitter) {
  'use strict';

  // @TODO: Add option to enable/disable extension for when:
  //   - playing
  //   - observing
  //   - analyzing (needs additional work...)
  // @TODO: Fix the gruntfile error about imgmin

  const Dmitlichess = {
    options: {},

    audioQueue: {},

    intervals: {
      misc: undefined,
      fill: undefined,
      long: undefined
    },

    emitters: {
      moves: undefined,
      gamestates: undefined
    },

    resetMiscInterval: function() {
      if (!this.intervals.misc) { return; }

      clearInterval(this.intervals.misc);

      if (this.options.enabled) {
        this.intervals.misc = setInterval(()=> { this.audioQueue.push('misc'); }, this.options.miscInterval);
      }
    },

    doGameOver: function(state = 'resign') {
      this.stop();

      // @TODO: Wait until there is no audio playing before pushing state/signoff
      this.audioQueue.clear();
      this.audioQueue.push(state);
      this.audioQueue.push('signoff');
    },

    addListeners: function(el) {
      // Attach event handlers
      el.addEventListener('queueCleared', ()=> this.resetMiscInterval());

      el.addEventListener('move',    (e)=> this.audioQueue.push(e.detail.notation));
      el.addEventListener('capture', (e)=> this.audioQueue.push(e.detail.notation));
      el.addEventListener('check',   ()=> this.audioQueue.push('check'));
      el.addEventListener('start',   ()=> this.audioQueue.push('start'));
      el.addEventListener('state',   (e)=> {
        if (e.detail.isOver) { this.doGameOver(e.detail.state); }
        // @TODO: Handle takeback offers?
      });

      chrome.runtime.onMessage.addListener((request)=> {
        if (request.message === 'optionsSaved' ) {
          // Apply saved dmitlichess options
          chrome.storage.sync.get(Utils.defaults, (items)=> {
            this[items.enabled ? 'start' : 'stop']();
          });
        }
      });
    },

    start: function() {
      this.emitters.moves.init();
      this.emitters.gamestates.init();

      // Play random sound bits
      this.intervals.misc = setInterval(()=> { this.audioQueue.push('misc'); }, this.options.miscInterval);
      this.intervals.fill = setInterval(()=> { this.audioQueue.push('fill'); }, this.options.fillInterval);
      this.intervals.long = setTimeout(()=> { this.audioQueue.push('long'); }, (Math.floor(Math.random() * this.options.longTimeout) + 1) * 1000);

      this.options.enabled = true;
    },

    stop: function() {
      this.emitters.moves.disconnect();
      this.emitters.gamestates.disconnect();

      if (this.intervals.misc) { clearInterval(this.intervals.misc); }
      if (this.intervals.fill) { clearInterval(this.intervals.fill); }
      if (this.intervals.long) { clearTimeout(this.intervals.long); }

      this.options.enabled = false;
    },

    init: function() {
      let elements = Utils.elements;

      if (!sounds) { return; }
      if (!elements.board) { return; }

      this.emitters.moves = Object.create(MoveEmitter, { elements: { value: elements } });
      this.emitters.gamestates = Object.create(GameStateEmitter, { elements: { value: elements } });

      chrome.storage.sync.get(Utils.defaults, (items)=> {
        this.options = items;

        this.audioQueue = Object.create(AudioQueue, {
          options: { value: this.options },
          elements: { value: elements }
        });

        this.addListeners(elements.main);

        // Start if the extension is enabled and the game is not over
        this[this.options.enabled && !Utils.isGameOver() ? 'start' : 'stop']();
      });
    }
  };

  Dmitlichess.init();
})(chrome, sounds, Utils, AudioQueue, MoveEmitter, GameStateEmitter);
