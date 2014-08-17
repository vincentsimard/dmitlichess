'use strict';

function CheckEmitter(board, elTrigger) {
  var handleMutation = function(mutations) {
    if (lichess && lichess.isGameOver()) { return; }

    mutations.forEach(function(mutation) {
      if (!mutation.target.classList.contains('check')) { return; }

      elTrigger.trigger('check');
    });
  };

  this.createObserver = function() {
    var observer = new MutationObserver(handleMutation);
    var config = { attributeFilter: ['class'], subtree: true };

    if (board) { observer.observe(board, config); }

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
