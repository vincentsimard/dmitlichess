const MoveEmitter = (function() {
  'use strict';

  function MoveEmitter(moves, el) {
    this.observers = [];

    let isCapture = function(notation) { return notation.indexOf('x') > -1; };
    let isCastle = function(notation) { return notation.indexOf('0-0') > -1; };
    let isCheck = function(notation) { return notation.indexOf('+') > -1; };

    let trimSymbols = function(notation) {
      return notation.replace('+', '').replace('#', '');
    };

    let handleMutation = function(mutations) {
      let added, notation;

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
          detail: {
            notation: trimSymbols(notation)
          }
        }));

        if (isCheck(notation)) {
          el.dispatchEvent(new CustomEvent('check'));
        }
      });
    };

    this.createObserver = function(moves) {
      let observer = new MutationObserver(handleMutation);
      let config = { childList: true, subtree: true };

      if (moves) { observer.observe(moves, config); }

      return observer;
    };

    this.disconnectObservers = function() {
      this.observers.map(function(o) {
        return o.disconnect();
      });
    };

    this.init = function() {
      this.observers = [];
      this.observers.push(this.createObserver(moves));
    };
  }

  return MoveEmitter;
})();
