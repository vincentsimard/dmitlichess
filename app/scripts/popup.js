'use strict';

var soundboard = document.querySelector('#soundboard');
var board = document.querySelector('#board');
var squares = document.querySelectorAll('.square');
var squaresArray = Array.prototype.slice.call(squares);

var keyModifier = '';

var options = { volume: 100 };


var makeAudio = function(file, volume) {
  var audio = new Audio(chrome.extension.getURL('ogg/' + options.commentator + '/' + file));
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

  // No sound for notation :(
  if (!file) { return; }

  audio = makeAudio(file, options.volume / 100);
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
    .concat(sounds['fill'])
    .concat(sounds['long']);

  var trimmed = list.map(function(item) {
    if (!item) { return; }

    item = item.replace('misc_', '');
    item = item.replace('long_', '');
    item = item.replace('.ogg', '');

    return item;
  });

  var createOption = function(value, text) {
    var option = document.createElement('option');
    option.value = value;
    option.text = text ? text.replace(/_/g, ' ') : '';
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
  if (!chrome.storage) { return; }

  chrome.storage.sync.get({
    volume: 100,
    commentator: 'dmitri',
    miscInterval: 10000,
    fillInterval: 17000,
    longTimeout: 3600
  }, function(items) {
    options = items;
    sounds = sounds[options.commentator];
    initMiscRandom();
    initMiscList();
    initBoard();
  });
};

init();
