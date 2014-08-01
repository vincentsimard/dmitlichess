'use strict';

var squares = document.querySelectorAll('#lichess .lichess_board .lcs');
var moveEmitter = new MoveEmitter(squares);

var sounds = {};

var initDmitry = function() {
  var makeAudio = function(file, volume) {
    console.log(chrome.extension.getURL('ogg/' + file));

    var audio = new Audio(chrome.extension.getURL('ogg/' + file));
    audio.volume = volume;

    return audio;
  };

  sounds.e4 = makeAudio('c5.ogg', 1);
  sounds.d4 = makeAudio('Nf3.ogg', 1);
};

// @TODO: Doesn't work
var disableDefaultSounds = function() {
  for (var prop in $.sound) {
    if ($.sound.hasOwnProperty(prop)) {
      $.sound[prop] = function() {};
    }
  }
};

var unleashDmitry = function() {
  $('#lichess').on('move', function(event, notation) {
    console.log('move', notation);

    sounds.e4.play();
  });

  $('#lichess').on('capture', function(event, notation) {
    console.log('capture', notation);

    sounds.d4.play();
  });
};

var init = function() {
  initDmitry();
  disableDefaultSounds();
  unleashDmitry();
};

init();
