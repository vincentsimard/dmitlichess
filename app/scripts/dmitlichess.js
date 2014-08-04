'use strict';

// @TODO: Queue sounds so Dmitry doesn't talk over himself
//        see http://blogs.msdn.com/b/ie/archive/2011/05/13/unlocking-the-power-of-html5-lt-audio-gt.aspx

// @TODO: Play random bits of Komarov at times ("yes", "unbelievable", etc.)

// @TODO: Fix gameStateEmitter

var makeAudio = function(file, volume) {
  var audio = new Audio(chrome.extension.getURL('ogg/' + file));
  audio.volume = volume;

  return audio;
};

var playSound = function(key) {
  console.log(key, sounds[key]);
  var files = sounds[key];
  var file;

  // :(
  if (!files) { return; }

  file = files[Math.floor(Math.random()*files.length)];

  makeAudio(file, 1).play();
};

var unleashDmitry = function() {
  lichess.$el.on('move capture', function(event, notation) {
    playSound(notation);
  });
  
  lichess.$el.on('check', function(event) {
    playSound('check');
  });

  lichess.$el.on('state', function(event, state) {
    console.log('Game Over');
  });
};

var init = function() {
  var moveEmitter, checkEmitter, gameStateEmitter;

  if (!sounds) { return; }
  if (!lichess.elBoard) { return; }

  moveEmitter = new MoveEmitter(lichess.elBoard);
  checkEmitter = new CheckEmitter(lichess.elBoard);
  gameStateEmitter = new GameStateEmitter();

  // lichess.disableDefaultSounds();

  unleashDmitry();
};

init();
