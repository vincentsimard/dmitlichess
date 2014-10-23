'use strict';

var lichess = {};

lichess.el = document.querySelector('#lichess');
lichess.$el = $(lichess.el);
lichess.elTable = lichess.el.querySelector('.lichess_ground .table');
lichess.elBoard = lichess.el.querySelector('.lichess_board');
lichess.elMoves = lichess.elTable ? lichess.elTable.querySelector('.moves') : undefined;
lichess.elSiteHeader = document.querySelector('#site_header');

lichess.isGameOver = function() {
  return this.elTable.classList.contains('finished');
};
