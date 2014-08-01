'use strict';

console.log('Dmitlichess loaded');

var targets = document.querySelectorAll('#lichess .lichess_board .lcs');
var targetsArray = Array.prototype.slice.call(targets);
var observers = [];

var isPieceMovement = function(mutation) {
  var movement = true;

  movement = movement && mutation.type === 'attributes';
  movement = movement && mutation.attributeName === 'class';

  movement = movement && mutation.target.classList.contains('moved');
  movement = movement && !mutation.target.classList.contains('droppable-hover');
  // movement = movement && mutation.target.querySelector('.piece');
  // if (movement) { console.log(mutation.target); }
  // if (movement) { console.log(mutation.target.children.length); }

  return movement;
};

var getDestination = function(mutation) { return mutation.target.id; };
var getPieceType = function(mutation) {
  var types = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
  var piece = mutation.target.querySelector('.piece');
  var i, type;

  if (piece) {
    for (i=0; i<types.length; i++) {
      type = piece.classList.contains(types[i]) ? types[i] : type;
    }
  }

  return type;
};

var handleMutation = function(mutations) {
  mutations.forEach(function(mutation) {
    if (!isPieceMovement(mutation)) { return; }

    var destination = getDestination(mutation);
    var type = getPieceType(mutation);

    console.log('type: ' + type);
    console.log(destination);
  });
};

var createObserver = function(target) {
  var observer = new MutationObserver(handleMutation);
  var config = { attributeFilter: ['class'] };
  // var config = { childList: true };

  observer.observe(target, config);

  return observer;
};

observers = targetsArray.map(createObserver);

// observer.disconnect();