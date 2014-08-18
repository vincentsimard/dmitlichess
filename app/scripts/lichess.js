'use strict';

var lichess = {};

lichess.el = document.querySelector('#lichess');
lichess.$el = $(lichess.el);
lichess.elTable = lichess.el.querySelector('.lichess_table');
lichess.elBoard = lichess.el.querySelector('.lichess_board');

lichess.isGameOver = function() {
  return this.elTable.classList.contains('finished');
};