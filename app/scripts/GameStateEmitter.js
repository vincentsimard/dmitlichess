const GameStateEmitter = (function(Utils) {
  'use strict';

  return {
    eventElement: undefined,
    header: undefined,

    observers: [],

    handleMutations: function() {
      if (!isGameOver()) { console.log('not over'); return; }
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

      this.eventElement.dispatchEvent(new CustomEvent('state', {
        detail: { state: state }
      }));

      // Disconnect after the game ends to prevent triggering again on rematch
      this.disconnect();
    },

    create: function() {
      let observer = new MutationObserver((mutations)=> this.handleMutations(mutations));
      let config = { childList: true, subtree: true };

      if (this.header) { observer.observe(this.header, config); }

      return observer;
    },

    disconnect: function() {
      this.observers.map((o)=> o.disconnect());
    },

    init: function() {
      this.observers = [];
      this.observers.push(this.create());

      console.log(Utils.isGameStart());

      if (Utils.isGameStart()) {
        console.log('game start');
      }
    }
  };
})(Utils);
