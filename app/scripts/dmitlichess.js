'use strict';

var squares = document.querySelectorAll('#lichess .lichess_board .lcs');
var moveEmitter = new MoveEmitter(squares);

$('#lichess').on('move', function(event, mutation, notation, origin) {
  console.log('move', notation);
});

$('#lichess').on('capture', function(event, mutation, notation, origin) {
  console.log('capture', notation);
});
