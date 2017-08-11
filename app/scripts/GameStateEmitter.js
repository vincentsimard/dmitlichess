const GameStateEmitter = (function(Utils) {
  'use strict';

  return {
    elements: Utils.elements,

    observers: [],

    handleMutations: function() {
      if (!Utils.isGameOver()) { console.log('not over'); return; }
      console.log('over');

      let text = this.header.innerText.toLowerCase();
      let states = [
        'checkmate',
        'draw',
        'time out',
        'white resigned',
        'black resigned'
      ];

      // @TODO: Bleh, do better
      let state;
      for (let i=0; i<states.length; i++) {
        if (text.indexOf(states[i]) > -1) { state = states[i]; }
      }

      this.elements.main.dispatchEvent(new CustomEvent('state', {
        detail: { state: state }
      }));

      // Disconnect after the game ends to prevent triggering again on rematch
      this.disconnect();
    },

    create: function() {
      let el = this.elements.header;
      let observer = new MutationObserver((mutations)=> this.handleMutations(mutations));
      let config = { childList: true, subtree: true };

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
        // @TODO:
        console.log('game start');
      }
    }
  };
})(Utils);
