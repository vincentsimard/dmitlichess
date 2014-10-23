'use strict';

function MoveEmitter(moves, elTrigger) {
  var isCapture = function(notation) { return notation.indexOf('x') > -1; };
  var isCastle = function(notation) { return notation.indexOf('0-0') > -1; };
  var isCheck = function(notation) { return notation.indexOf('+') > -1; };

  var handleMutation = function(mutations) {
    var added, notation;

    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length < 1) { return; }

      added = mutation.addedNodes[0];

      if (added.nodeName === 'TR') {
        added = added.querySelector('td:last-child');
      }

      notation = added.textContent;

      if (!notation) { return; }

      elTrigger.trigger(isCapture(notation) ? 'capture' : 'move', [notation]);
      if (isCheck(notation)) { elTrigger.trigger('check'); }
    });
  };

  this.createObserver = function(moves) {
    var observer = new MutationObserver(handleMutation);
    var config = { childList: true, subtree: true };

    if (moves) { observer.observe(moves, config); }

    return observer;
  };

  this.disconnectObservers = function() {
    this.observers.map(function(o) {
      return o.disconnect();
    });
  };

  this.createObserver(moves);
}
