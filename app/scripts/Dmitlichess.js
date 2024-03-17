'use strict';

class Dmitlichess {
  constructor(movesElement) {
    if (!movesElement) { throw new Error('Move list with notation not found'); }

    this.movesElement = movesElement;
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

  addListeners = (target) => {
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
    browser.storage.onChanged.addListener(async (changes, area) => {
      // Restart dmitlichess when options are saved
      if (area !== 'sync') { return; }

      // Stop to prevent sounds being repeated multiple times
      this.stop();

      // Apply saved dmitlichess options and restart if enabled
      const items = await UserPrefs.getOptions();
      this.options = items;
      this[this.options.enabled ? 'start' : 'stop']();
    });
  }

  init = async () => {
    const status = document.querySelector('.status');
    const isGameOver = !!status;

    this.options = await UserPrefs.getOptions();

    this.addListeners(this.movesElement);
    
    // Start if the extension is enabled and the game is not over
    this[this.options.enabled && !isGameOver ? 'start' : 'stop']();
  }

  gameOver = (state = 'resign') => {
    this.stop();
    this.audioQueue.clear(true);
    this.audioQueue.push(state);
    this.audioQueue.push('signoff');
  }

  resetMiscInterval = () => {
    if (!this.intervals.misc) { return; }

    clearInterval(this.intervals.misc);

    if (this.options.enabled) {
      this.intervals.misc = setInterval(() => { this.audioQueue.push('misc'); }, this.options.miscInterval);
    }
  }

  start = async () => {
    // Load the sounds for the selected commentator
    const url = chrome.runtime.getURL(`ogg/${this.options.commentator}/meta.json`);
    const response = await fetch(url);
    const json = await response.json();

    this.sounds[this.options.commentator] = json.sounds;
    this.audioQueue = new AudioQueue(this.options, this.movesElement, this.sounds);
    this.emitters.moves.init();
    this.emitters.gameStates.init();

    // Play random sound bits
    this.intervals.misc = setInterval(() => { this.audioQueue.push('misc'); }, this.options.miscInterval);
    this.intervals.fill = setInterval(() => { this.audioQueue.push('fill'); }, this.options.fillInterval);
    this.intervals.long = setTimeout(() => { this.audioQueue.push('long'); }, (Math.floor(Math.random() * this.options.longTimeout) + 1) * 1000);

    this.options.enabled = true;
  }

  stop = () => {
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
// The move notation should be one of the first element created a lichess page is loaded...
// @TODO figure a more reliable/efficient way to disable the extension on pages without moves notation
const observer = new MutationObserver((mutations, observerInstance) => {
  // Workaround to get $moves-tag set in
  // https://github.com/ornicar/lila/blob/master/ui/round/css/_constants.scss#L10
  // The actual element name is changed often.
  const movesElement = document.querySelector('l4x');

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
