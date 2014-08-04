'use strict';

// @TODO: Play random bits of Komarov at times ("yes", "unbelievable", etc.)
// @TODO: Fix gameStateEmitter

var audioQueue = [];

var makeAudio = function(file, volume) {
  var audio = new Audio(chrome.extension.getURL('ogg/' + file));
  audio.volume = volume;

  return audio;
};

var getRandomSound = function(key) {
  var files = sounds[key];

  return files && files[Math.floor(Math.random()*files.length)];
};

var playNextSound = function() {
  if (audioQueue.length > 0) {
    audioQueue[0].play();
  }
};

var queueSound = function(key) {
  var file = getRandomSound(key);
  var audio;

  // No sound for notation :(
  if (!file) { return; }

  audio = makeAudio(file, 1);

  audio.addEventListener('ended', function() {
    audioQueue.shift();
    playNextSound();
  }, false);

  audioQueue.push(audio);

  if (audioQueue.length === 1) { playNextSound(); }
};

var unleashDmitry = function() {
  // Attach event handlers
  lichess.$el.on({
    'move capture': function(event, notation) { queueSound(notation); },
    'check': function(event) { queueSound('check'); },
    'state': function(event, state) { console.log('Game Over'); }
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
