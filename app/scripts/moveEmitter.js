'use strict';

function MoveEmitter(board, elTrigger) {
  var PIECES = {
    pawn:   '',
    knight: 'N',
    bishop: 'B',
    rook:   'R',
    queen:  'Q',
    king:   'K'
  };
  var PIECE_NAMES = Object.keys(PIECES);

  // Used to prevent triggering mutation handlers after castling/capturing
  var mutationSkips = 0;

  var isMovement = function(mutation) {
    return mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains('cg-piece');
  };

  var isCapture = function(mutation) {
    console.log(mutation);

    return false;

    return mutation.removedNodes &&
      mutation.removedNodes.length > 0 &&
      mutation.removedNodes[0].parentNode.classList.contains('lichess_tomb');
  };

  var isCaptureFromNotation = function(notation) { return notation.indexOf('x') > -1; };
  var isCastleFromNotation = function(notation) { return notation.indexOf('0-0') > -1; };

  var isCastleKingside = function(origin, destination) {
    var defaultOrigin = origin === 'e1' || origin === 'e8';
    var expectedDestination = destination === 'g1' || destination === 'g8';

    return defaultOrigin && expectedDestination;
  };

  var isCastleQueenside = function(origin, destination) {
    var defaultOrigin = origin === 'e1' || origin === 'e8';
    var expectedDestination = destination === 'c1' || destination === 'c8';

    return defaultOrigin && expectedDestination;
  };

  var getNotationFromSquare = function(square) {
    // @TODO: Use class that has length = 2 instead of [1]
    if (square) {
      return square.classList[1];
    }
  };

  var getDestination = function(mutation) {
    var square = board.querySelector('.last-move.occupied');

    return getNotationFromSquare(square) || '';
  };

  var getOrigin = function() {
    var square = board.querySelector('.last-move:not(.occupied)');

    return getNotationFromSquare(square) || '';
  };

  var getPieceName = function(mutation) {
    var piece = mutation.target.querySelector('.cg-piece');
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

  var getNotation = function(origin, destination, pieceName, capture) {
    var abbr = getPieceAbbr(pieceName);
    var captureNotation = (abbr === '' ? origin.charAt(0) : '') + 'x';
    var notation = abbr + (capture ? captureNotation : '') + destination;

    if (abbr === 'K') {
      if (isCastleKingside(origin, destination)) { notation = '0-0'; }
      if (isCastleQueenside(origin, destination)) { notation = '0-0-0'; }
    }

    return notation;
  };

  var getNotationFromMutation = function(mutation) {
    if (!isMovement(mutation) && !isCapture(mutation)) { return; }

    var origin = getOrigin();
    var destination = getDestination(mutation);
    var pieceName = getPieceName(mutation);
    var capture = isCapture(mutation);

    return getNotation(origin, destination, pieceName, capture);
  };

  var handleMutation = function(mutations) {
    mutations.forEach(function(mutation) {
      var notation, isCaptured, isCastled;
      
      notation = getNotationFromMutation(mutation);

      if (mutationSkips > 0) { return; }
      if (!notation) { return; }

      isCaptured = isCaptureFromNotation(notation);
      isCastled = isCastleFromNotation(notation);

      // When piece captures or castling moves occur,
      // more mutations are triggerd.
      // mutationSkips is used to prevent additional triggering of events
      if (isCaptured) { mutationSkips = mutationSkips + 1; }
      if (isCastled) { mutationSkips = mutationSkips + 3; } // @TODO: This isn't working properly

      elTrigger.trigger(isCaptured ? 'capture' : 'move', [notation]);
    });

    if (mutationSkips > 0) { mutationSkips--; }
  };



  this.createObserver = function(square) {
    var observer = new MutationObserver(handleMutation);
    var config = { childList: true };

    if (square) { observer.observe(square, config); }

    return observer;
  };

  this.disconnectObservers = function() {
    this.observers.map(function(o) {
      return o.disconnect();
    });
  };

  this.squares = Array.prototype.slice.call(board.querySelectorAll('.cg-square'));
  this.observers = this.squares.map(this.createObserver);
}
