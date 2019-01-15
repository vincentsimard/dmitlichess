class Dmitlichess {
  constructor() {
    this.options = {};
    this.audioQueue = {};
    this.intervals = {
      misc: undefined,
      fill: undefined,
      long: undefined
    };

    this.elements = {
      main: document.querySelector('#lichess'), // @TODO: Dispatch events on the body and remove this unnecessary document.querySelector?
      moves: document.querySelector('#lichess .moves')
    };

    this.emitters = {
      moves: undefined,
      gameStates: undefined
    };

    if (!sounds) { throw new Error('No sound files'); }
    if (!this.elements.moves) { throw new Error('Lichess moves notation not found'); }

    this.emitters = {
      moves: new MoveEmitter(this.elements),
      gameStates: new GameStateEmitter(this.elements)
    };

    browser.storage.sync.get(Utils.defaults).then((items)=> {
      this.options = items;

      this.audioQueue = new AudioQueue(this.options, this.elements);

      this.addListeners(this.elements.main);

      // Start if the extension is enabled and the game is not over
      this[this.options.enabled && !Utils.isGameOver() ? 'start' : 'stop']();
    });
  }

  addListeners(el) {
    // Attach event handlers
    el.addEventListener('queueCleared', ()=> this.resetMiscInterval());

    el.addEventListener('move',    (e)=> this.audioQueue.push(e.detail.notation));
    el.addEventListener('capture', (e)=> this.audioQueue.push(e.detail.notation));
    el.addEventListener('check',   ()=> this.audioQueue.push('check'));
    el.addEventListener('start',   ()=> this.audioQueue.push('start'));
    el.addEventListener('state',   (e)=> {
      if (e.detail.isOver) { this.gameOver(e.detail.state); }
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
  }

  init() {
    console.log('booted');
  }

  gameOver(state = 'resign') {
    this.stop();

    this.audioQueue.clear(true);
    this.audioQueue.push(state);
    this.audioQueue.push('signoff');
  }

  resetMiscInterval() {
    if (!this.intervals.misc) { return; }

    clearInterval(this.intervals.misc);

    if (this.options.enabled) {
      this.intervals.misc = setInterval(()=> { this.audioQueue.push('misc'); }, this.options.miscInterval);
    }
  }

  start() {
    this.emitters.moves.init();
    this.emitters.gameStates.init();

    // Play random sound bits
    this.intervals.misc = setInterval(()=> { this.audioQueue.push('misc'); }, this.options.miscInterval);
    this.intervals.fill = setInterval(()=> { this.audioQueue.push('fill'); }, this.options.fillInterval);
    this.intervals.long = setTimeout(()=> { this.audioQueue.push('long'); }, (Math.floor(Math.random() * this.options.longTimeout) + 1) * 1000);

    this.options.enabled = true;
  }

  stop() {
    this.emitters.moves.disconnect();
    this.emitters.gameStates.disconnect();

    if (this.intervals.misc) { clearInterval(this.intervals.misc); }
    if (this.intervals.fill) { clearInterval(this.intervals.fill); }
    if (this.intervals.long) { clearTimeout(this.intervals.long); }

    this.options.enabled = false;
  }
}



// Wait for the move list element to be created
// Then initialize the extension
let mutationsCount = 0;
const observer = new MutationObserver((mutations, observerInstance) => {
  const movesElement = document.querySelector('#lichess .moves');

  // Disconnect after 10 mutations
  // the move notation should one of the first element created a lichess page is loaded
  // @TODO figure a more efficient way to disable the extension on pages without moves notation
  mutationsCount++;
  if (mutationsCount > 10) { observerInstance.disconnect(); }

  if (!movesElement) { return; }

  window.dmitli = new Dmitlichess();
  window.dmitli.init();

  observerInstance.disconnect();
});

observer.observe(document, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});
