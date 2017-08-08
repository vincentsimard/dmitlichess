var GameStateEmitter = (function() {
  'use strict';

  function GameStateEmitter(header, elTrigger) {
    var handleMutation = function() {
      if (!(lichess && lichess.isGameOver())) { return; }

      var text = header.innerText.toLowerCase();
      var states = ['checkmate', 'draw', 'time out', 'white resigned', 'black resigned'];
      var state, i;

      for (i=0; i<states.length; i++) {
        if (text.indexOf(states[i]) > -1) { state = states[i]; }
      }

      elTrigger.trigger('state', [state]);

      // Automatically disconnect after the game ends
      // to prevent triggering again on rematch
      // @TODO: Figure out a better solution
      this.disconnect();
    };

    this.createObserver = function() {
      var observer = new MutationObserver(handleMutation);
      var config = { childList: true, subtree: true };

      if (header) { observer.observe(header, config); }

      return observer;
    };

    this.disconnectObservers = function() {
      this.observers.map(function(o) {
        return o.disconnect();
      });
    };

    this.observers = [];
    this.observers.push(this.createObserver());
  }

  return GameStateEmitter;
})();
