'use strict';

class GameStateEmitter {
  constructor(movesElement, dispatchTarget) {
    this.movesElement = movesElement;
    this.dispatchTarget = dispatchTarget;
    this.observers = [];
  }
  
  resultElementAdded(mutations) {
    return mutations.some(mutation => MutationUtils.hasAddedNodes(mutation, 'result-wrap'));
  }

  handleMutations(mutations) {
    const states = [
      'aborted',
      'stalemate',
      'checkmate',
      'draw',
      'time out',
      'white resigned',
      'black resigned'
    ];

    const status = document.querySelector('.status');
    const isGameOver = !!status;

    if (!this.resultElementAdded(mutations)) { return; }
    if (!isGameOver) { return; }

    const text = status && status.innerText.toLowerCase();
    const state = states.reduce((a, v) => text.includes(v) ? v : a, undefined);

    this.dispatchTarget.dispatchEvent(new CustomEvent('state', {
      detail: {
        isOver: true,
        state: state
      }
    }));

    // Disconnect after the game ends to prevent triggering again on rematch
    this.disconnect();
  }
  
  createObserver() {
    const el = this.movesElement;
    const observer = new MutationObserver(mutations => this.handleMutations(mutations));
    const config = { childList: true, subtree: false };

    if (el) { observer.observe(el, config); }

    return observer;
  }

  disconnect() {
    this.observers.map(o => o.disconnect());
  }

  init() {
    this.observers = [];
    this.observers.push(this.createObserver());

    const isGameStart = () => this.movesElement && this.movesElement.children.length === 0;

    if (isGameStart()) {
      this.dispatchTarget.dispatchEvent(new CustomEvent('start'));
    }
  }
}
