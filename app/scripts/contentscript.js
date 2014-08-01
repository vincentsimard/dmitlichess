'use strict';

console.log('Dmitlichess loaded');

// @TODO: Detect castling
// @TODO: Play sound based on notation
// @TODO: ????
// @TODO: Profit

var PIECES = {
  pawn:   '',
  knight: 'N',
  bishop: 'B',
  rook:   'R',
  queen:  'Q',
  king:   'K'
};
var PIECE_NAMES = Object.keys(PIECES);

var pieceCaptured = false;

var targets = document.querySelectorAll('#lichess .lichess_board .lcs');
var targetsArray = Array.prototype.slice.call(targets);
var observers = [];

var getBoard = function() {
  return document.querySelector('#lichess .lichess_board');
};

var isPieceMovement = function(mutation) {
  return mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains('piece');
};

var isPieceCapture = function(mutation) {
  return mutation.removedNodes &&
    mutation.removedNodes.length > 0 &&
    mutation.removedNodes[0].parentNode.classList.contains('lichess_tomb');
};

var getDestination = function(mutation) {
  return mutation.target.id;
};

var getOrigin = function() {
  var board = getBoard();
  var moved = board.querySelectorAll('.moved');
  var movedArray = Array.prototype.slice.call(moved);

  return movedArray.filter(function(el) {
    return el.childElementCount < 2;
  })[0];
};

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

var getPieceAbbr = function(name) {
  return PIECES[name];
};

var getNotation = function(square, pieceName, capture) {
  var abbr = getPieceAbbr(pieceName);
  var captureNotation = capture ? (abbr === '' ? capture.id.charAt(0) : '') + 'x' : '';

  return abbr + captureNotation + square;
};

var isCheck = function() {
  return document.querySelectorAll('#lichess .lichess_board .lcs.check').length > 0;
};

var komarov = function(mutation) {
  var square = getDestination(mutation);
  var pieceName = getPieceName(mutation);
  var notation = getNotation(square, pieceName, pieceCaptured);

  console.log(notation);
};

var handleMutation = function(mutations) {
  mutations.forEach(function(mutation) {
    if (isPieceMovement(mutation)) {
      komarov(mutation);
    }

    if (isPieceCapture(mutation)) {
      pieceCaptured = true;
      pieceCaptured = getOrigin();

      return;
    }
  });

  pieceCaptured = false;
};

var createObserver = function(target) {
  var observer = new MutationObserver(handleMutation);
  var config = { childList: true };

  observer.observe(target, config);

  return observer;
};

observers = targetsArray.map(createObserver);
