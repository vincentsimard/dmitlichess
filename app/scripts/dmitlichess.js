'use strict';

var squares = document.querySelectorAll('#lichess .lichess_board .lcs');
var moveEmitter = new MoveEmitter(squares);

var initHandlers = function() {
  $('#lichess').on('move', function(event, notation) {
    console.log('move', notation);
  });

  $('#lichess').on('capture', function(event, notation) {
    console.log('capture', notation);
  });
};

var init = function() {
  initHandlers();
};

init();
