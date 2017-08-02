'use strict';

// @TODO: Increase volume of audio files and normalize/replaygain
// @TODO: Game start sounds
// @TODO: Add option to enable/disable extension for when:
//   - playing
//   - observing
//   - analyzing (needs additional work...)
// @TODO: Handle notation like Nbd7, Rae1, etc.
// @TODO: Running grunt build doesn't copy scripts/options.js to the dist folder

// Default options:
//   Volume: 50%
//   Misc sound: every 15 seconds
//   Yes sound: every 13 seconds
//   Long sound: once before the 1 hour mark (random time during the game)
var options = {
  volume: 50,
  miscInterval: 15000,
  yesInterval: 13000,
  longTimeout: 3600
};

var miscInterval, yesInterval, longTimeout;

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
  if (key.indexOf('x') === 1) { return getRandomSound(key.substring(1)); }

  // Translate some game end states
  // @TODO: Individual sounds for white/black resigned?
  if (key.indexOf('white resigned') >= 0) { return getRandomSound('resign'); }
  if (key.indexOf('black resigned') >= 0) { return getRandomSound('resign'); }
  if (key.indexOf('time out') >= 0) { return getRandomSound('flag'); }
};

var playNextSound = function() {
  if (audioQueue.length > 0) {
    audioQueue[0].play();
  }
};

var resetMiscInterval = function() {
  if (!miscInterval) { return; }

  clearInterval(miscInterval);
  miscInterval = setInterval(function() { queueSound('misc'); }, options.miscInterval);
};

var queueSound = function(key, notAuto) {
  if (typeof key === 'undefined') { return; }

  var file = getRandomSound(key) || getGenericSound(key);
  var audio;

  // console.log(file);

  var trueFiveOutOfSix = function() {
    return !!(Math.floor(Math.random() * 6));
  };

  var playNext = function() {
    audioQueue.shift();
    playNextSound();
  };

  var resetQueue = function() {
    audioQueue = [];
    resetMiscInterval();
  };

  var doEnded = function() {
    // Clear the queue if there are too many sounds queued
    // so Dmitry is not too behind the game with his commentary?
    if (audioQueue.length > 3) {
      resetQueue();
    } else {
      playNext();
    }
  };

  // No sound for notation :(
  if (!file) {
    // Random chance (1/6) to play a 'yes' sound instead of nothing
    // when the sound doesn't exist
    if (trueFiveOutOfSix()) { return; }
    file = getRandomSound('yes');
  }

  audio = makeAudio(file, options.volume / 100);
  audio.addEventListener('ended', doEnded, false);

  audioQueue.push(audio);

  if (audioQueue.length === 1) { playNextSound(); }
};

var unleashDmitry = function(elTrigger) {
  // Attach event handlers
  elTrigger.on({
    'move capture': function(event, notation) { queueSound(notation); },
    'check': function(event) { queueSound('check'); },
    'state': function(event, state) {
      queueSound(state);

      if (miscInterval) { clearInterval(miscInterval); }
      if (yesInterval) { clearInterval(yesInterval); }
      if (longTimeout) { clearTimeout(longTimeout); }
    }
  });

  // Play random sound bits
  // @TODO: Add an interval for Super GM names shoutouts (Levon Aronian, Magnus Carrrlsen, yessss)
  yesInterval = setInterval(function() { queueSound('yes'); }, options.yesInterval);
  miscInterval = setInterval(function() { queueSound('misc'); }, options.miscInterval);
  longTimeout = setTimeout(function() { queueSound('long'); }, (Math.floor(Math.random() * options.longTimeout) + 1) * 1000);
};

var init = function() {
  var moveEmitter, gameStateEmitter;

  if (!sounds) { return; }
  if (!lichess.elBoard) { return; }

  moveEmitter = new MoveEmitter(lichess.elMoves, lichess.$el);
  gameStateEmitter = new GameStateEmitter(lichess.elSiteHeader, lichess.$el);

  chrome.storage.sync.get(options, function(items) {
    options = items;
    unleashDmitry(lichess.$el);
  });
};

init();
