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

    var state;
    var tableText = getTable().innerText.toLowerCase();

    // @TODO: Doesn't work because the text is updated after the class
    if (tableText.indexOf('checkmate') > -1) { state = 'checkmate'; }

    $('#lichess').trigger('state', [state]);
  };

  this.createObserver = function() {
    var observer = new MutationObserver(handleMutation);
    var config = { attributes: true };

    observer.observe(getTable(), config);

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
