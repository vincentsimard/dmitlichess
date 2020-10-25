'use strict';

class MoveEmitter {
  constructor(movesElement, dispatchTarget) {
    this.movesElement = movesElement;
    this.dispatchTarget = dispatchTarget;
    this.observers = [];
  }

  handleMutations(mutations) {
    const isCapture = notation => notation.includes('x');
    const isCastle = notation => notation.includes('0-0');
    const isCheck = notation => notation.includes('+');
    const trimSymbols = notation => notation.replace(/#|\+|@/g, '');

    mutations.forEach(mutation => {
      if (!MutationUtils.hasAddedNodes(mutation)) { return; }

      let added = mutation.addedNodes[0];
      const notation = added.textContent;

      if (added.nodeName === 'TURN') {
        added = added.querySelector('MOVE.active');
      }

      if (!notation) { return; }
      // If the node is active, it will have $active-class which is renamed often.
      // As a workaround, just check that it has a class name set.
      // https://github.com/ornicar/lila/blob/master/ui/round/css/_constants.scs#L12
      if (added.classList.length === 0) { return; }

      const notationType = isCapture(notation) ? 'capture' : 'move';
      const eventDetail = {
        detail: { notation: trimSymbols(notation) }
      };

      this.dispatchTarget.dispatchEvent(new CustomEvent(notationType, eventDetail));

      if (isCheck(notation)) {
        this.dispatchTarget.dispatchEvent(new CustomEvent('check'));
      }
    });
  }

  createObserver() {
    const el = this.movesElement;
    const observer = new MutationObserver(mutations => this.handleMutations(mutations));
    const config = { childList: true, subtree: true };

    if (el) { observer.observe(el, config); }

    return observer;
  }

  disconnect() {
    this.observers.map(o => o.disconnect());
  }

  init() {
    this.observers = [];
    this.observers.push(this.createObserver());
  }
}
