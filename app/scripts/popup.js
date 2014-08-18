'use strict';

var soundboard = document.querySelector('#soundboard');
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

var playSound = function(key, isMisc) {
  var file = isMisc ? key : getRandomSound(key);
  var audio;

  console.log(file);

  // No sound for notation :(
  if (!file) { return; }

  audio = makeAudio(file, 1);
  audio.play();
};

var initBoard = function() {
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

  squaresArray.map(createSquareListener);
};

var initMiscRandom = function() {
  document.querySelector('#randomMisc').addEventListener('click', function(event) {
    playSound('misc');
  });
};

var initMiscList = function() {
  var list = []
    .concat(sounds['misc'])
    .concat(sounds['check'])
    .concat(sounds['checkmate'])
    .concat(sounds['draw'])
    .concat(sounds['resign'])
    .concat(sounds['start'])
    .concat(sounds['name'])
    .concat(sounds['check'])
    .concat(sounds['yes'])
    .concat(sounds['long']);

  var trimmed = list.map(function(item) {
    var name = item;

    name = name.replace('misc_', '');
    name = name.replace('long_', '');
    name = name.replace('.ogg', '');

    return name;
  });

  var createOption = function(value, text) {
    var option = document.createElement('option');
    option.value = value;
    option.text = text;
    return option;
  }

  var selectList = document.createElement('select');
  selectList.id = 'miscList';

  selectList.appendChild(createOption('', ''));
  for (var i = 0; i < trimmed.length; i++) {
    selectList.appendChild(createOption(list[i], trimmed[i]));
  }
  
  soundboard.appendChild(selectList);

  selectList.addEventListener('change', function(event) {
    playSound(this.value, true);
  });
};

var init = function() {
  if (!sounds) { return; }
  if (!board) { return; }

  initMiscRandom();
  initMiscList();
  initBoard();
};

init();
