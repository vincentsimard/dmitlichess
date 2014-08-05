'use strict';

// @TODO: Play random bits of Komarov at times ("yes", "unbelievable", etc.)
// @TODO: Fix gameStateEmitter

var audioQueue = [];
var soundsPlayed = 0;

var makeAudio = function(file, volume) {
  var audio = new Audio(chrome.extension.getURL('ogg/' + file));
  audio.volume = volume;

  return audio;
};

var getRandomSound = function(key) {
  var files = sounds[key];

  return files && files[Math.floor(Math.random()*files.length)];
};

var getGenericSound = function(key) {
  // Generic capture sounds
  if (key.indexOf('x') === 1) {
    return getRandomSound(key.substring(1));
  }
};

var playNextSound = function() {
  if (audioQueue.length > 0) {
    audioQueue[0].play();
  }
};

var queueSound = function(key) {
  console.log(key);

  var file = getRandomSound(key) || getGenericSound(key);
  var audio;

  // No sound for notation :(
  if (!file) { return; }
  // if (!file) { file = getRandomSound('yes'); }

  audio = makeAudio(file, 1);

  audio.addEventListener('ended', function() {
    audioQueue.shift();
    playNextSound();
  }, false);

  audioQueue.push(audio);

  if (audioQueue.length === 1) { playNextSound(); }

  // Clear the queue if there are too many sounds queued
  // so Dmitry is not too behind the game with his commentary?
  if (audioQueue.length > 4) { audioQueue = []; }
};

var unleashDmitry = function() {
  // Attach event handlers
  lichess.$el.on({
    'move capture': function(event, notation) { queueSound(notation); },
    'check': function(event) { queueSound('check'); },
    'state': function(event, state) { console.log('Game Over'); }
  });

  // setInterval(function() { queueSound('yes'); }, 17000);
  // setInterval(function() { queueSound('misc'); }, 24000);
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
