(function(browser, sounds, Utils) {
  'use strict';

  // @TODO: Can't listen to O-O, O-O-O sounds
  const PopupCtrl = {
    options: UserPrefs.defaults,

    generateMiscList: function() {
      const s = sounds[this.options.commentator];
      const soundFiles = []
        .concat(s.misc)
        .concat(s.check)
        .concat(s.checkmate)
        .concat(s.stalemate)
        .concat(s.draw)
        .concat(s.resign)
        .concat(s.start)
        .concat(s.name)
        .concat(s.check)
        .concat(s.fill)
        .concat(s.long)
        .concat(s.signoff)
        .filter((n)=> !!n); // Remove undefined entries (if sounds don't exist for one category)

      const soundboard = document.querySelector('#soundboard');
      const selectList = document.createElement('select');
      selectList.id = 'miscList';

      const toDisplayName = filename => filename
        .replace(/misc_|long_|\.ogg/g, '')
        .replace(/_/g, ' ');

      const createOption = filename => new Option(toDisplayName(filename), filename);

      selectList.add(new Option('', ''));
      soundFiles.forEach(sound => selectList.add(createOption(sound)));

      soundboard.appendChild(selectList);
    },

    addListeners: function() {
      const self = this;
      const squares = Array.from(document.querySelectorAll('#board .square'));
      let keyModifier = '';

      const createSquareListener = square => {
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

      squares.map(createSquareListener);

      // "Play a random commentary" link
      document.getElementById('randomMisc').addEventListener('click', ()=> {
        Utils.audio.play('misc', this.options.commentator, this.options.volume);
      });

      // Full sound list dropdown
      document.getElementById('miscList').addEventListener('change', (event)=> {
        Utils.audio.play(event.target.value, this.options.commentator, this.options.volume, false);
      });

      document.getElementById('enabled').addEventListener('change', (event)=> {
        UserPrefs.saveOptions({ enabled: event.target.checked }).then(Utils.sendSaveMessage);
      });
    },

    init: function() {
      if (!sounds) { return; }
      if (!browser.storage) { return; }

      UserPrefs.getOptions().then((items)=> {
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
