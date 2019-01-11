const MoveEmitter = (function(Utils) {
  'use strict';

  const isCapture = (notation)=> notation.includes('x');
  const isCastle = (notation)=> notation.includes('0-0');
  const isCheck = (notation)=> notation.includes('+');
  const trimSymbols = (notation)=> notation.replace('+', '').replace('#', '');

  return {
    elements: Utils.elements,

    observers: [],

    handleMutations: function(mutations) {
      mutations.forEach((mutation)=> {
        if (!Utils.mutation.hasAddedNodes(mutation)) { return; }

        let added = mutation.addedNodes[0];
        const notation = added.textContent;

        if (added.nodeName === 'TURN') {
          added = added.querySelector('MOVE.active');
        }

        if (!notation) { return; }
        if (!added.classList.contains('active')) { return; }

        const notationType = isCapture(notation) ? 'capture' : 'move';
        const eventDetail = {
          detail: { notation: trimSymbols(notation) }
        };

        this.elements.main.dispatchEvent(new CustomEvent(notationType, eventDetail));

        if (isCheck(notation)) {
          this.elements.main.dispatchEvent(new CustomEvent('check'));
        }
      });
    },

    create: function() {
      const el = this.elements.moves;
      const observer = new MutationObserver((mutations)=> this.handleMutations(mutations));
      const config = { childList: true, subtree: true };

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
})(Utils);
