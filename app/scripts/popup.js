(function(chrome, sounds, Utils) {
  'use strict';

  let options = Utils.defaults;

  let playSound = function(key, isRandom = true) {
    let file = isRandom ? Utils.audio.getRandom(key, options.commentator) : key;
    let audio;

    // No sound for notation :(
    if (!file) { return; }

    audio = Utils.audio.create(file, options.commentator, options.volume / 100);
    audio.play();
  };

  let initBoard = function() {
    const squares = document.querySelectorAll('#board .square');
    const squaresArray = Array.prototype.slice.call(squares);

    let keyModifier = '';

    let createSquareListener = function(square) {
      square.addEventListener('click', function(event) {
        let keys = ['N', 'B', 'R', 'Q', 'K'];
        let notation = this.id;

        if (event.shiftKey) { notation = 'x' + notation; }
        if (keys.indexOf(keyModifier.toUpperCase()) >= 0) { notation = keyModifier + notation; }

        playSound(notation);
      });
    };

    document.addEventListener('keydown', function(event) {
      keyModifier = String.fromCharCode(event.keyCode);
    });

    document.addEventListener('keyup', function() {
      keyModifier = '';
    });

    squaresArray.map(createSquareListener);
  };

  let initMiscRandom = function() {
    document.querySelector('#randomMisc').addEventListener('click', function() {
      playSound('misc');
    });
  };

  let initMiscList = function() {
    let soundboard = document.querySelector('#soundboard');

    let list = []
      .concat(sounds.misc)
      .concat(sounds.check)
      .concat(sounds.checkmate)
      .concat(sounds.draw)
      .concat(sounds.resign)
      .concat(sounds.start)
      .concat(sounds.name)
      .concat(sounds.check)
      .concat(sounds.fill)
      .concat(sounds.long);

    let trimmed = list.map(function(item) {
      if (!item) { return; }

      item = item.replace('misc_', '');
      item = item.replace('long_', '');
      item = item.replace('.ogg', '');

      return item;
    });

    let createOption = function(value, text) {
      let option = document.createElement('option');
      option.value = value;
      option.text = text ? text.replace(/_/g, ' ') : '';
      return option;
    };

    let selectList = document.createElement('select');
    selectList.id = 'miscList';

    selectList.appendChild(createOption('', ''));
    for (let i = 0; i < trimmed.length; i++) {
      selectList.appendChild(createOption(list[i], trimmed[i]));
    }

    soundboard.appendChild(selectList);

    selectList.addEventListener('change', function() {
      playSound(this.value, false);
    });
  };

  let init = function() {
    if (!sounds) { return; }
    if (!chrome.storage) { return; }

    chrome.storage.sync.get(Utils.defauls, (items)=> {
      options = items;
      sounds = sounds[options.commentator];
      initMiscRandom();
      initMiscList();
      initBoard();
    });
  };

  init();
})(chrome, sounds, Utils);
