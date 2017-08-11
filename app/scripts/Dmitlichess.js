(function(chrome, sounds, Utils, AudioQueue, MoveEmitter, GameStateEmitter) {
  'use strict';

  // @TODO: Game start/end sounds
  // @TODO: Add option to enable/disable extension for when:
  //   - playing
  //   - observing
  //   - analyzing (needs additional work...)
  // @TODO: Fix the gruntfile error about imgmin
  // @TODO: Play signoff sound after game end sound

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

    addListeners: function(el) {
      // Attach event handlers
      el.addEventListener('queueCleared', ()=> this.resetMiscInterval());

      el.addEventListener('move',    (e)=> this.audioQueue.push(e.detail.notation));
      el.addEventListener('capture', (e)=> this.audioQueue.push(e.detail.notation));
      el.addEventListener('check',   ()=> this.audioQueue.push('check'));
      el.addEventListener('state',   (e)=> {
        this.stop();

        this.audioQueue.clear();
        this.audioQueue.push(e.detail.state);
        this.audioQueue.push('signoff');
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
      let elements = {
        main:   document.querySelector('#lichess'),
        board:  document.querySelector('#lichess .lichess_board'),
        moves:  document.querySelector('#lichess .moves'),
        header: document.querySelector('#site_header')
      };

      if (!sounds) { return; }
      if (!elements.board) { return; }

      // @TODO: Send elements object instead of individual vars when using Object.create
      this.emitters.moves = Object.create(MoveEmitter, {
        moves: { value: elements.moves },
        eventElement: { value: elements.main }
      });

      this.emitters.gamestates = Object.create(GameStateEmitter, {
        header: { value: elements.header },
        eventElement: { value: elements.main }
      });

      chrome.storage.sync.get(Utils.defaults, (items)=> {
        this.options = items;

        this.audioQueue = Object.create(AudioQueue, {
          options: { value: this.options },
          eventElement: { value: elements.main }
        });

        this.addListeners(elements.main);

        this[this.options.enabled ? 'start' : 'stop']();
      });
    }
  };

  Dmitlichess.init();
})(chrome, sounds, Utils, AudioQueue, MoveEmitter, GameStateEmitter);
