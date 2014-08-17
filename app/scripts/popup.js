'use strict';

var board = document.querySelector('#board');
var squares = document.querySelectorAll('.square');
var squaresArray = Array.prototype.slice.call(squares);

var createClickListener = function(square) {
  square.addEventListener('click', function() {
    alert(this.id);
  });
};

squaresArray.map(createClickListener);

console.log(squares);

// console.log('\'Allo \'Allo! Popup');
