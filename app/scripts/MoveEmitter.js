const MoveEmitter = (function() {
  'use strict';

  let isCapture = (notation)=> notation.indexOf('x') > -1;
  let isCastle = (notation)=> notation.indexOf('0-0') > -1;
  let isCheck = (notation)=> notation.indexOf('+') > -1;
  let trimSymbols = (notation)=> notation.replace('+', '').replace('#', '');

  return {
    elements: Utils.elements,

    observers: [],

    handleMutations: function(mutations) {
      mutations.forEach((mutation)=> {
        if (mutation.addedNodes.length < 1) { return; }

        let added = mutation.addedNodes[0];
        let notation = added.textContent;

        if (added.nodeName === 'TURN') {
          added = added.querySelector('MOVE.active');
        }

        if (!notation) { return; }
        if (!added.classList.contains('active')) { return; }

        let notationType = isCapture(notation) ? 'capture' : 'move';
        let eventDetail = {
          detail: { notation: trimSymbols(notation) }
        };

        this.elements.main.dispatchEvent(new CustomEvent(notationType, eventDetail));

        if (isCheck(notation)) {
          this.elements.main.dispatchEvent(new CustomEvent('check'));
        }
      });
    },

    create: function() {
      let el = this.elements.moves;
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
    }
  };
})();
