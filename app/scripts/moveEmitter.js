var MoveEmitter = (function() {
  'use strict';

  function MoveEmitter(moves, el) {
    var isCapture = function(notation) { return notation.indexOf('x') > -1; };
    var isCastle = function(notation) { return notation.indexOf('0-0') > -1; };
    var isCheck = function(notation) { return notation.indexOf('+') > -1; };

    var trimSymbols = function(notation) {
      return notation.replace('+', '').replace('#', '');
    };

    var handleMutation = function(mutations) {
      var added, notation;

      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length < 1) { return; }

        added = mutation.addedNodes[0];

        if (added.nodeName === 'TURN') {
          added = added.querySelector('MOVE.active');
        }

        notation = added.textContent;

        if (!notation) { return; }
        if (!added.classList.contains('active')) { return; }

        let notationType = isCapture(notation) ? 'capture' : 'move';

        el.dispatchEvent(new CustomEvent(notationType, {
          detail: trimSymbols(notation)
        }));

        if (isCheck(notation)) {
          el.dispatchEvent(new CustomEvent('check'));
        }
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

  return MoveEmitter;
})();
