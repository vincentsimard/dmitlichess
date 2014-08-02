'use strict';

// @TODO: Detect castling
// @TODO: Detect check
// @TODO: Detect checkmate, resign, draw

function MoveEmitter(targets) {
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

  var getBoard = function() {
    return document.querySelector('#lichess .lichess_board');
  };

  var isMovement = function(mutation) {
    return mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains('piece');
  };

  var isCapture = function(mutation) {
    return mutation.removedNodes &&
      mutation.removedNodes.length > 0 &&
      mutation.removedNodes[0].parentNode.classList.contains('lichess_tomb');
  };

  var isCaptureFromNotation = function(notation) { return notation.indexOf('x') >= 0; };
  var isCastleFromNotation = function(notation) { return notation.indexOf('0-0') >= 0; };

  var getDestination = function(mutation) {
    return mutation.target.id;
  };

  var getOrigin = function() {
    var board = getBoard();
    var moved = board.querySelectorAll('.moved');
    var movedArray = Array.prototype.slice.call(moved);

    var origin = movedArray.filter(function(el) {
      // @TODO: Rewrite this, `< 2` means there's no .piece child element...
      return el.childElementCount < 2;
    })[0];

    if (origin) { return origin.id; }
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
    var origin = getOrigin();
    var destination = getDestination(mutation);
    var pieceName = getPieceName(mutation);
    var capture = isCapture(mutation);

    return getNotation(origin, destination, pieceName, capture);
  };

  var isCheck = function() {
    return document.querySelectorAll('#lichess .lichess_board .lcs.check').length > 0;
  };

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

  var handleMutation = function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutationSkips > 0) { return; }
      if (!isMovement(mutation) && !isCapture(mutation)) { return; }

      var notation = getNotationFromMutation(mutation);
      var isCaptured = isCaptureFromNotation(notation);
      var isCastled = isCastleFromNotation(notation);

      // When piece captures or castling moves occur,
      // more mutations are triggerd.
      // mutationSkips is used to prevent additional triggering of events
      if (isCaptured) { mutationSkips = mutationSkips + 1; }
      if (isCastled) { mutationSkips = mutationSkips + 2; }

      $('#lichess').trigger(isCaptured ? 'capture' : 'move', [notation]);
    });

    if (mutationSkips > 0) { mutationSkips--; }
  };



  this.createObserver = function(target) {
    var observer = new MutationObserver(handleMutation);
    var config = { childList: true };

    observer.observe(target, config);

    return observer;
  };

  this.disconnectObservers = function() {
    this.observers.map(function(o) {
      return o.disconnect();
    });
  };

  this.targets = Array.prototype.slice.call(targets);
  this.observers = this.targets.map(this.createObserver);
}
