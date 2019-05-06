'use strict';

class PopupCtrl {
  constructor(options) {
    this.options = UserPrefs.defaults;
    this.sounds = {};
  }

  generateMiscList() {
    const s = this.sounds[this.options.commentator];
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
      .filter(n => !!n); // Remove undefined entries (if sounds don't exist for one category)

    const soundboard = document.querySelector('#soundboard');
    const selectList = document.createElement('select');
    selectList.id = 'miscList';

    // @TODO: Remove trailing numbers at the end of files
    const toDisplayName = filename => filename
      .replace(/misc_|long_|\.ogg/g, '')
      .replace(/_/g, ' ');

    const createOption = filename => new Option(toDisplayName(filename), filename);

    selectList.add(new Option('', ''));
    soundFiles.forEach(sound => selectList.add(createOption(sound)));

    soundboard.appendChild(selectList);
  }

  addListeners() {
    let keyModifier = '';
    const {commentator, volume} = this.options;
    const squares = Array.from(document.querySelectorAll('#board .square'));

    const createSquareEventListener = event => {
      // @TODO: Provide a way to listen to O-O, O-O-O sounds
      const keys = ['N', 'B', 'R', 'Q', 'K'];
      let notation = event.target.id;

      if (event.shiftKey) { notation = 'x' + notation; }
      if (keys.includes(keyModifier.toUpperCase())) { notation = keyModifier + notation; }

      AudioUtils.play(this.sounds, notation, commentator, volume);
    };

    squares.forEach(square => square.addEventListener('click', createSquareEventListener));

    document.addEventListener('keydown', event => {
      keyModifier = String.fromCharCode(event.keyCode);
    });

    document.addEventListener('keyup', () => {
      keyModifier = '';
    });

    // "Play a random commentary" link
    document.getElementById('randomMisc').addEventListener('click', () => {
      AudioUtils.play(this.sounds, 'misc', this.options.commentator, this.options.volume);
    });

    // Full sound list dropdown
    document.getElementById('miscList').addEventListener('change', event => {
      AudioUtils.play(this.sounds, event.target.value, this.options.commentator, this.options.volume, false);
    });

    document.getElementById('enabled').addEventListener('change', event => {
      UserPrefs.saveOptions({ enabled: event.target.checked });
    });
  }

  init() {
    UserPrefs.getOptions().then(items => {
      this.options = items;

      document.getElementById('enabled').checked = this.options.enabled;

      const url = chrome.runtime.getURL(`ogg/${this.options.commentator}/meta.json`);
      fetch(url)
        .then((response) => response.json())
        .then(json => this.sounds[this.options.commentator] = json.sounds)
        .then(() => {
          this.generateMiscList();
          this.addListeners();
        });
    });
  }
}

window.popupCtrl = new PopupCtrl();
window.popupCtrl.init();
