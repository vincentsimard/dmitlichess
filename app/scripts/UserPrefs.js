'use strict';

const defaults = {
  volume: 100,          // Percentage
  miscInterval: 10000,  // Every 10 seconds
  fillInterval: 17000,  // Every 17 seconds
  longTimeout: 3600,    // Once before the 1 hour mark (random time)
  commentator: 'dmitri',
  enabled: true
};

class UserPrefs {
  static getOptions(keys = defaults) {
    return browser.storage.sync.get(keys);
  }

  static saveOptions(items) {
    return browser.storage.sync.set(items);
  }
}

UserPrefs.defaults = defaults;
