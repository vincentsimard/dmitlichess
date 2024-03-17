'use strict';

const defaults = {
  volume: 100,          // Percentage
  miscInterval: 10000,  // Every 10 seconds
  fillInterval: 17000,  // Every 17 seconds
  longTimeout: 3600,    // Once before the 1 hour mark (random time)
  commentator: 'dmitri',
  commentators: ['dmitri', 'maurice', 'yasser', 'zugaddict'],
  enabled: true
};

class UserPrefs {
  static async getOptions(keys = defaults) {
    try {
      const items = await browser.storage.sync.get(keys);
      return items;
    } catch (error) {
      console.error('Error retrieving options:', error);
      throw error;
    }
  }

  static async saveOptions(items) {
    try {
      await browser.storage.sync.set(items);
    } catch (error) {
      console.error('Error saving options:', error);
      throw error;
    }
  }
}

UserPrefs.defaults = defaults;
