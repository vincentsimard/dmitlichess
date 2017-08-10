(function(chrome, sounds, Utils) {
  'use strict';

  const PopupCtrl = {
    options: Utils.defaults,

    playSound: function(key, isRandom = true) {
      let audio;
      let file = isRandom ? Utils.audio.getRandom(key, this.options.commentator) : key;

      // No sound for the notation :(
      if (!file) { return; }

      audio = Utils.audio.create(file, this.options.commentator, this.options.volume / 100);
      audio.play();
    },

    generateMiscList: function() {
      let soundboard = document.querySelector('#soundboard');

      let s = sounds[this.options.commentator];
      let list = []
        .concat(s.misc)
        .concat(s.check)
        .concat(s.checkmate)
        .concat(s.draw)
        .concat(s.resign)
        .concat(s.start)
        .concat(s.name)
        .concat(s.check)
        .concat(s.fill)
        .concat(s.long)
        .filter((n)=> !!n); // Remove undefined entries (if sounds don't exist for one category)

      let trimmed = list.map((item)=> {
        if (!item) { return; }

        item = item.replace('misc_', '');
        item = item.replace('long_', '');
        item = item.replace('.ogg', '');

        return item;
      });

      let selectList = document.createElement('select');
      selectList.id = 'miscList';

      let createOption = function(text, index) {
        let option = document.createElement('option');

        option.text = text ? text.replace(/_/g, ' ') : '';
        option.value = list[index];

        selectList.appendChild(option);

        return option;
      };

      selectList.appendChild(createOption('', ''));
      trimmed.map((item, i)=> { createOption(item, i); });

      soundboard.appendChild(selectList);
    },

    addEventListeners: function() {
      let self = this;
      let squares = document.querySelectorAll('#board .square');
      let squaresArray = Array.prototype.slice.call(squares);
      let keyModifier = '';

      let createSquareListener = (square)=> {
        square.addEventListener('click', function(event) {
          const keys = ['N', 'B', 'R', 'Q', 'K'];
          let notation = this.id;

          if (event.shiftKey) { notation = 'x' + notation; }
          if (keys.indexOf(keyModifier.toUpperCase()) >= 0) { notation = keyModifier + notation; }

          self.playSound(notation);
        });
      };

      document.addEventListener('keydown', (event)=> {
        keyModifier = String.fromCharCode(event.keyCode);
      });

      document.addEventListener('keyup', ()=> {
        keyModifier = '';
      });

      squaresArray.map(createSquareListener);

      // "Play a random commentary" link
      document.querySelector('#randomMisc').addEventListener('click', ()=> {
        this.playSound('misc');
      });

      // Full sound list dropdown
      document.querySelector('#miscList').addEventListener('change', (event)=> {
        this.playSound(event.target.value, false);
      });
    },

    init: function() {
      if (!sounds) { return; }
      if (!chrome.storage) { return; }

      chrome.storage.sync.get(Utils.defauls, (items)=> {
        this.options = items;

        this.generateMiscList();
        this.addEventListeners();
      });
    }
  };

  let ctrl = Object.create(PopupCtrl);
  ctrl.init();
})(chrome, sounds, Utils);
