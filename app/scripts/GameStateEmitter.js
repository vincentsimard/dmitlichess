const GameStateEmitter = (function(Utils) {
  'use strict';

  const states = [
    'aborted',
    'stalemate',
    'checkmate',
    'draw',
    'time out',
    'white resigned',
    'black resigned'
  ];

  const resultElementAdded = function(mutations) {
    return mutations.some((mutation)=> Utils.mutation.hasAddedNodes(mutation, 'result_wrap'));
  };

  return {
    elements: Utils.elements,

    observers: [],

    handleMutations: function(mutations) {
      if (!resultElementAdded(mutations)) { return; }
      if (!Utils.isGameOver()) { return; }

      const status = document.querySelector('.status');
      const text = status && status.innerText.toLowerCase();
      const state = states.reduce((a, v)=> text.includes(v) ? v : a, undefined);

      this.elements.main.dispatchEvent(new CustomEvent('state', {
        detail: {
          isOver: true,
          state: state
        }
      }));

      // Disconnect after the game ends to prevent triggering again on rematch
      this.disconnect();
    },

    create: function() {
      const el = this.elements.moves;
      const observer = new MutationObserver((mutations)=> this.handleMutations(mutations));
      const config = { childList: true, subtree: false };

      if (el) { observer.observe(el, config); }

      return observer;
    },

    disconnect: function() {
      this.observers.map((o)=> o.disconnect());
    },

    init: function() {
      this.observers = [];
      this.observers.push(this.create());

      if (Utils.isGameStart()) {
        this.elements.main.dispatchEvent(new CustomEvent('start'));
      }
    }
  };
})(Utils);
