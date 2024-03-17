'use strict';

const throwIfMissing = () => { throw new Error('Missing parameter'); };

class AudioUtils {
  static create(file = throwIfMissing, commentator = UserPrefs.defaults.commentator, volume = UserPrefs.defaults.volume) {
    const path = browser.runtime.getURL(`ogg/${commentator}/${file}`);
    const audio = new Audio(path);
    audio.volume = volume;

    return audio;
  }

  static getRandom(sounds = throwIfMissing, key = throwIfMissing, commentator = UserPrefs.defaults.commentator) {
    const files = sounds[commentator][key];

    return files && files[Math.floor(Math.random()*files.length)];
  }

  static getGeneric(sounds = throwIfMissing, key = throwIfMissing, commentator = UserPrefs.defaults.commentator) {
    // Generic capture sounds. e.g.: use xf7 if Nxf7 sound doesn't exist
    if (key.indexOf('x') === 1) { return this.getRandom(sounds, key.substring(1), commentator); }

    // @TODO: Also handle other fallback notation:
    //   - Nd2 if Nbd2 sound doesn't exist
    //   - Bx if Bxf4 doesn't exist
    //   - h1 if Kh1 doesn't exist

    // Translate some game end states
    // @TODO: Individual sounds for white/black resigned?
    /*
    if (key.includes('white resigned')) { return this.getRandom(sounds, 'resign', commentator); }
    if (key.includes('black resigned')) { return this.getRandom(sounds, 'resign', commentator); }
    */
    if (key.includes('resigned')) { return this.getRandom(sounds, 'resign', commentator); }
    if (key.includes('time out')) { return this.getRandom(sounds, 'flag', commentator); }
  }

  static play(sounds, key, commentator = UserPrefs.defaults.commentator, volume = UserPrefs.defaults.volume, isRandom = true) {
    const file = isRandom ? this.getRandom(sounds, key, commentator) : key;

    // No sound for the notation :(
    if (!file) { return; }

    const audio = this.create(file, commentator, volume / 100);
    audio.play();
  }
}
