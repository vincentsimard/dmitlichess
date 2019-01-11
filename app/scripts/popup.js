(function(browser, sounds, Utils) {
  'use strict';

  const PopupCtrl = {
    options: Utils.defaults,

    generateMiscList: function() {
      const soundboard = document.querySelector('#soundboard');

      const s = sounds[this.options.commentator];
      const list = []
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

      const trimmed = list.map((item)=> {
        if (!item) { return; }

        item = item.replace('misc_', '');
        item = item.replace('long_', '');
        item = item.replace('.ogg', '');

        return item;
      });

      const selectList = document.createElement('select');
      selectList.id = 'miscList';

      const createOption = function(text, index) {
        const option = document.createElement('option');

        option.text = text ? text.replace(/_/g, ' ') : '';
        option.value = list[index];

        selectList.appendChild(option);

        return option;
      };

      selectList.appendChild(createOption('', ''));
      trimmed.map((item, i)=> { createOption(item, i); });

      soundboard.appendChild(selectList);
    },

    addListeners: function() {
      const self = this;
      const squares = document.querySelectorAll('#board .square');
      const squaresArray = Array.prototype.slice.call(squares);
      let keyModifier = '';

      const createSquareListener = (square)=> {
        square.addEventListener('click', function(event) {
          const keys = ['N', 'B', 'R', 'Q', 'K'];
          let notation = this.id;

          if (event.shiftKey) { notation = 'x' + notation; }
          if (keys.includes(keyModifier.toUpperCase())) { notation = keyModifier + notation; }

          Utils.audio.play(notation, self.options.commentator, self.options.volume);
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
      document.getElementById('randomMisc').addEventListener('click', ()=> {
        Utils.audio.play('misc', this.options.commentator, this.options.volume);
      });

      // Full sound list dropdown
      document.getElementById('miscList').addEventListener('change', (event)=> {
        Utils.audio.play(event.target.value, this.options.commentator, this.options.volume, false);
      });

      document.getElementById('enabled').addEventListener('change', (event)=> {
        browser.storage.sync.set({ enabled: event.target.checked }).then(Utils.sendSaveMessage);
      });
    },

    init: function() {
      if (!sounds) { return; }
      if (!browser.storage) { return; }

      browser.storage.sync.get(Utils.defaults).then((items)=> {
        this.options = items;

        document.getElementById('enabled').checked = this.options.enabled;

        this.generateMiscList();
        this.addListeners();
      });
    }
  };

  const ctrl = Object.create(PopupCtrl);
  ctrl.init();
})(browser, sounds, Utils);
