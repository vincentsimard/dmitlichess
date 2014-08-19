'use strict';

function GameStateEmitter(table, elTrigger) {
  var handleMutation = function(mutations) {
    if (!(lichess && lichess.isGameOver())) { return; }

    var tableText = table.innerText.toLowerCase();
    var states = ['checkmate', 'draw', 'time out', 'white resigned', 'black resigned'];
    var state, i;

    for (i=0; i<states.length; i++) {
      if (tableText.indexOf(states[i]) > -1) { state = states[i]; }
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

    if (table) { observer.observe(table, config); }

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
