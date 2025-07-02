'use strict';

class Dmitlichess {
  constructor(movesElement) {
    if (!movesElement) { throw new Error('Move list with notation not found'); }

    this.movesElement = movesElement;
    this.options = {};
    this.audioQueue = {};
    this.sounds = {};

    this.intervals = {
      misc: null,
      fill: null,
      long: null
    };

    this.emitters = {
      moves: new MoveEmitter(movesElement, movesElement),
      gameStates: new GameStateEmitter(movesElement, movesElement)
    };
  }

  addListeners = (target) => {
    const push = (notation) => this.audioQueue?.push?.(notation);

    // Moves and game events
    target.addEventListener('move', e => push(e.detail.notation));
    target.addEventListener('capture', e => push(e.detail.notation));
    target.addEventListener('check', () => push('check'));
    target.addEventListener('start', () => push('start'));

    target.addEventListener('state', e => {
      if (e.detail?.isOver) this.gameOver(e.detail.state);
      // TODO: Handle takeback offers?
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
      this.options = await UserPrefs.getOptions();
      if (this.options.enabled) {
        await this.start();
      } else {
        this.stop();
      }
    });
  };

  init = async () => {
    const isGameOver = !!document.querySelector('.status');
    this.options = await UserPrefs.getOptions();

    this.addListeners(this.movesElement);
    
    // Start if the extension is enabled and the game is not over
    if (this.options.enabled && !isGameOver) {
      await this.start();
    } else {
      this.stop();
    }
  };

  gameOver = (state = 'resign') => {
    this.stop();
    this.audioQueue?.clear?.(true);
    this.audioQueue?.push?.(state);
    this.audioQueue?.push?.('signoff');
  };

  resetMiscInterval = () => {
    if (this.intervals.misc) {
      clearInterval(this.intervals.misc);
    }

    if (this.options.enabled) {
      this.intervals.misc = setInterval(() => {
        this.audioQueue?.push?.('misc');
      }, this.options.miscInterval);
    }
  };

  start = async () => {
    // Load the sounds for the selected commentator
    const url = chrome.runtime.getURL(`ogg/${this.options.commentator}/meta.json`);
    const res = await fetch(url);
    const { sounds } = await res.json();

    this.sounds[this.options.commentator] = sounds;
    this.audioQueue = new AudioQueue(this.options, this.movesElement, this.sounds);
    this.emitters.moves.init();
    this.emitters.gameStates.init();

    // Play random sound bits
    const randomTimeout = (Math.floor(Math.random() * this.options.longTimeout) + 1) * 1000;
    this.intervals.long = setTimeout(() => { this.audioQueue.push('long'); }, randomTimeout);
    this.intervals.misc = setInterval(() => { this.audioQueue.push('misc'); }, this.options.miscInterval);
    this.intervals.fill = setInterval(() => { this.audioQueue.push('fill'); }, this.options.fillInterval);

    this.options.enabled = true;
  }

  stop = () => {
    this.emitters.moves.disconnect();
    this.emitters.gameStates.disconnect();

    clearInterval(this.intervals.misc);
    clearInterval(this.intervals.fill);
    clearTimeout(this.intervals.long);

    this.intervals.misc = this.intervals.fill = this.intervals.long = null;

    this.options.enabled = false;
  };
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
