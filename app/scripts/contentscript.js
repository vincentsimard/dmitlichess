'use strict';

console.log('Dmitlichess loaded');

var PIECES = {
  pawn:   '',
  knight: 'N',
  bishop: 'B',
  rook:   'R',
  queen:  'Q',
  king:   'K'
};
var PIECE_NAMES = Object.keys(PIECES);

var targets = document.querySelectorAll('#lichess .lichess_board .lcs');
var targetsArray = Array.prototype.slice.call(targets);
var observers = [];

var isPieceMovement = function(mutation) {
  return mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains('piece');
};

var getDestination = function(mutation) { return mutation.target.id; };

var getPieceName = function(mutation) {
  var piece = mutation.target.querySelector('.piece');
  var i, name;

  if (piece) {
    for (i=0; i<PIECE_NAMES.length; i++) {
      name = PIECE_NAMES[i];

      if (piece.classList.contains(name)) {
        return name;
      }
    }
  }
};

var getPieceAbbr = function(name) { return PIECES[name]; };

var getNotation = function(square, pieceName) {
  return getPieceAbbr(pieceName) + square;
};

var handleMutation = function(mutations) {
  mutations.forEach(function(mutation) {
    if (!isPieceMovement(mutation)) { return; }

    var square = getDestination(mutation);
    var pieceName = getPieceName(mutation);
    var notation = getNotation(square, pieceName);

    console.log(notation);
  });
};

var createObserver = function(target) {
  var observer = new MutationObserver(handleMutation);
  var config = { childList: true };

  observer.observe(target, config);

  return observer;
};

observers = targetsArray.map(createObserver);

// observer.disconnect();