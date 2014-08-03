'use strict';

function CheckEmitter(board) {
  var handleMutation = function(mutations) {
    mutations.forEach(function(mutation) {
      if (!mutation.target.classList.contains('check')) { return; }

      $('#lichess').trigger('check');
    });
  };

  this.createObserver = function() {
    var observer = new MutationObserver(handleMutation);
    var config = { attributeFilter: ['class'], subtree: true };

    observer.observe(board, config);

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
