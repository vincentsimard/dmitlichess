'use strict';

var board = document.querySelector('#board');
var squares = document.querySelectorAll('.square');
var squaresArray = Array.prototype.slice.call(squares);

var keyModifier = '';

var makeAudio = function(file, volume) {
  var audio = new Audio(chrome.extension.getURL('ogg/' + file));
  audio.volume = volume;

  return audio;
};

var getRandomSound = function(key) {
  var files = sounds[key];

  return files && files[Math.floor(Math.random()*files.length)];
};

var playSound = function(key) {
  var file = getRandomSound(key);
  var audio;

  // No sound for notation :(
  if (!file) { return; }

  audio = makeAudio(file, 1);
  audio.play();
};

var init = function() {
  if (!sounds) { return; }
  if (!board) { return; }

  var createSquareListener = function(square) {
    square.addEventListener('click', function(event) {
      var keys = ['N', 'B', 'R', 'Q', 'K'];
      var notation = this.id;
      
      if (event.shiftKey) { notation = 'x' + notation; }
      if (keys.indexOf(keyModifier.toUpperCase()) >= 0) { notation = keyModifier + notation; }

      playSound(notation);
    });
  };

  document.addEventListener('keydown', function(event) {
    keyModifier = String.fromCharCode(event.keyCode);
  });

  document.addEventListener('keyup', function(event) {
    keyModifier = '';
  });

  document.querySelector('#misc').addEventListener('click', function(event) {
    playSound('misc');
  });

  squaresArray.map(createSquareListener);
};

init();
