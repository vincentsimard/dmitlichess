(function(chrome, sounds, Utils, AudioQueue, MoveEmitter, GameStateEmitter) {
  'use strict';

  // @TODO: Game start/end sounds
  // @TODO: Fix castling sounds
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

    resetMiscInterval: function() {
      if (!this.intervals.misc) { return; }

      clearInterval(this.intervals.misc);
      this.intervals.misc = setInterval(()=> { this.audioQueue.push('misc'); }, this.options.miscInterval);
    },

    start: function(el) {
      // Attach event handlers
      el.addEventListener('move',    (e)=> this.audioQueue.push(e.detail.notation));
      el.addEventListener('capture', (e)=> this.audioQueue.push(e.detail.notation));
      el.addEventListener('check',   ()=> this.audioQueue.push('check'));
      el.addEventListener('state',   (e)=> {
        this.audioQueue.push(e.detail.state);

        if (this.intervals.misc) { clearInterval(this.intervals.misc); }
        if (this.intervals.fill) { clearInterval(this.intervals.fill); }
        if (this.intervals.long) { clearTimeout(this.intervals.long); }
      });

      // Play random sound bits
      this.intervals.misc = setInterval(()=> { this.audioQueue.push('misc'); }, this.options.miscInterval);
      this.intervals.fill = setInterval(()=> { this.audioQueue.push('fill'); }, this.options.fillInterval);
      this.intervals.long = setTimeout(()=> { this.audioQueue.push('long'); }, (Math.floor(Math.random() * this.options.longTimeout) + 1) * 1000);
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

      chrome.storage.sync.get(Utils.defaults, (items)=> {
        this.options = items;

        this.audioQueue = Object.create(AudioQueue, {
          options: { value: this.options }
        });

        this.start(elements.main);
      });
    }
  };

  Dmitlichess.init();
})(chrome, sounds, Utils, AudioQueue, MoveEmitter, GameStateEmitter);
