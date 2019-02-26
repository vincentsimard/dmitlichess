'use strict';

class Dmitlichess {
  constructor(movesElement) {
    this.movesElement = movesElement;

    if (!this.movesElement) { throw new Error('Move list with notation not found'); }

    this.options = {};
    this.audioQueue = {};
    this.sounds = {};

    this.intervals = {
      misc: undefined,
      fill: undefined,
      long: undefined
    };

    this.emitters = {
      moves: new MoveEmitter(this.movesElement, this.movesElement),
      gameStates: new GameStateEmitter(this.movesElement, this.movesElement)
    };
  }

  addListeners(target) {
    // Moves and game events
    target.addEventListener('move', e => this.audioQueue.push(e.detail.notation));
    target.addEventListener('capture', e => this.audioQueue.push(e.detail.notation));
    target.addEventListener('check', () => this.audioQueue.push('check'));
    target.addEventListener('start', () => this.audioQueue.push('start'));
    target.addEventListener('state', e => {
      if (e.detail.isOver) { this.gameOver(e.detail.state); }
      // @TODO: Handle takeback offers?
    });

    // Cleared audio queue when there is too many sounds queued
    target.addEventListener('queueCleared', () => this.resetMiscInterval());

    // Options saved
    browser.storage.onChanged.addListener((changes, area) => {
      // Restart dmitlichess when options are saved
      if (area !== 'sync') { return; }

      // Stop to prevent sounds being repeated multiple times
      this.stop();

      // Apply saved dmitlichess options and restart if enabled
      UserPrefs.getOptions().then(items => {
        this.options = items;

        this[items.enabled ? 'start' : 'stop']();
      });
    });
  }

  init() {
    UserPrefs.getOptions().then(items => {
      const status = document.querySelector('#lichess .lichess_ground .status');
      const isGameOver = !!status;

      this.options = items;

      this.addListeners(this.movesElement);

      // Start if the extension is enabled and the game is not over
      this[this.options.enabled && !isGameOver ? 'start' : 'stop']();
    });
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
      this.intervals.misc = setInterval(() => { this.audioQueue.push('misc'); }, this.options.miscInterval);
    }
  }

  start() {
    // Load the sounds for the selected commentator
    const url = chrome.runtime.getURL(`ogg/${this.options.commentator}/manifest.json`);

    fetch(url)
      .then(response => response.json())
      .then(json => this.sounds[this.options.commentator] = json.sounds)
      .then(() => {
        this.audioQueue = new AudioQueue(this.options, this.movesElement, this.sounds);
    
        this.emitters.moves.init();
        this.emitters.gameStates.init();
    
        // Play random sound bits
        this.intervals.misc = setInterval(() => { this.audioQueue.push('misc'); }, this.options.miscInterval);
        this.intervals.fill = setInterval(() => { this.audioQueue.push('fill'); }, this.options.fillInterval);
        this.intervals.long = setTimeout(() => { this.audioQueue.push('long'); }, (Math.floor(Math.random() * this.options.longTimeout) + 1) * 1000);
    
        this.options.enabled = true;
      });
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

  window.dmitli = new Dmitlichess(movesElement);
  window.dmitli.init();

  observerInstance.disconnect();
});

observer.observe(document, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});
