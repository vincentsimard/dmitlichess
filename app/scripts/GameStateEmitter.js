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

  let resultElementAdded = function(mutations) {
    return mutations.some((mutation)=> Utils.mutation.hasAddedNodes(mutation, 'result_wrap'));
  };

  return {
    elements: Utils.elements,

    observers: [],

    handleMutations: function(mutations) {
      if (!resultElementAdded(mutations)) { return; }
      if (!Utils.isGameOver()) { return; }

      let status = document.querySelector('.status');
      let text = status && status.innerText.toLowerCase();
      let state = states.reduce((a, v)=> text.indexOf(v) > -1 ? v : a, undefined);

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
      let el = this.elements.moves;
      let observer = new MutationObserver((mutations)=> this.handleMutations(mutations));
      let config = { childList: true, subtree: false };

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
