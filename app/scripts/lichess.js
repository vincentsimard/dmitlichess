'use strict';

var lichess = {};

lichess.el = document.querySelector('#lichess');
lichess.$el = $(lichess.el);
lichess.elTable = lichess.el.querySelector('.lichess_ground');
lichess.elBoard = lichess.el.querySelector('.lichess_board');
lichess.elMoves = lichess.elTable ? lichess.elTable.querySelector('.moves') : undefined;

lichess.isGameOver = function() {
  return this.elTable.classList.contains('finished');
};
