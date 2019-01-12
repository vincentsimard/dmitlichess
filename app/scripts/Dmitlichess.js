// const browser = require('webextension-polyfill');

(function(browser, sounds, Utils, AudioQueue, MoveEmitter, GameStateEmitter) {
  'use strict';

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

      this.audioQueue.clear(true);
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

      browser.runtime.onMessage.addListener((request)=> {
        if (request.message === 'optionsSaved' ) {
          // Apply saved dmitlichess options
          browser.storage.sync.get(Utils.defaults).then((items)=> {
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
      const elements = Utils.getElements();

      if (!sounds) { return; }
      if (!elements.board) { return; }
      if (!elements.moves) { return; }

      this.emitters.moves = Object.create(MoveEmitter, { elements: { value: elements } });
      this.emitters.gamestates = Object.create(GameStateEmitter, { elements: { value: elements } });

      browser.storage.sync.get(Utils.defaults).then((items)=> {
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

  setTimeout(()=> Dmitlichess.init(), 1);
})(browser, sounds, Utils, AudioQueue, MoveEmitter, GameStateEmitter);
