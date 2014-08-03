'use strict';

function GameStateEmitter() {
  var getTable = function() {
    return document.querySelector('#lichess .lichess_table');
  };

  var isGameOver = function() {
    return getTable().classList.contains('finished');
  };

  var handleMutation = function(mutations) {
    if (!isGameOver()) { return; }

    var tableText = getTable().innerText.toLowerCase();
    var states = ['checkmate', 'draw', 'time out', 'white resigned', 'black resigned'];
    var state, i;

    // @TODO: Doesn't work because the text is updated after the class
    for (i=0; i<states.length; i++) {
      if (tableText.indexOf(states[i]) > -1) { state = states[i]; }
    }


    $('#lichess').trigger('state', [state]);
  };

  this.createObserver = function() {
    var observer = new MutationObserver(handleMutation);
    var config = { attributes: true };
    var table = getTable();

    if (table) { observer.observe(getTable(), config); }

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
