(function(browser, Utils) {
  'use strict';

  const OptionsCtrl = {
    elements: {
      enabled: document.getElementById('enabled'),
      volume: document.getElementById('volume'),
      commentators: document.querySelectorAll('input[name="commentator"]'),
      miscInterval: document.getElementById('miscInterval'),
      fillInterval: document.getElementById('fillInterval'),
      longTimeout: document.getElementById('longTimeout'),
      status: document.getElementById('status'),
      saveButton: document.getElementById('save'),
      defaultButton: document.getElementById('default')
    },

    save: function(showStatus = true) {
      const doSaved = ()=> {
        Utils.sendSaveMessage();

        if (showStatus) {
          // Update status to let user know options were saved.
          const status = this.elements.status;

          status.textContent = 'Options saved. Please refresh your lichess.org page';
          status.classList.remove('faded');

          setTimeout(()=> status.classList.add('faded'), 5000);
        }
      };

      browser.storage.sync.set({
        commentator:  document.querySelector('input[name="commentator"]:checked').value,
        enabled:      this.elements.enabled.checked,
        volume:       this.elements.volume.value,
        miscInterval: this.elements.miscInterval.value,
        fillInterval: this.elements.fillInterval.value,
        longTimeout:  this.elements.longTimeout.value
      }).then(doSaved);
    },

    reset: function() {
      document.getElementById('commentator_' + Utils.defaults.commentator).checked = true;
      this.elements.enabled.checked = Utils.defaults.enabled;
      this.elements.miscInterval.value = Utils.defaults.miscInterval;
      this.elements.fillInterval.value = Utils.defaults.fillInterval;
      this.elements.longTimeout.value = Utils.defaults.longTimeout;

      this.save();
    },

    // Restores select box and checkbox state using the preferences storage.
    restore: function() {
      // Default values
      browser.storage.sync.get(Utils.defaults).then((items)=> {
        document.getElementById('commentator_' + items.commentator).checked = true;
        this.elements.enabled.checked = items.enabled;
        this.elements.volume.value = items.volume;
        this.elements.miscInterval.value = items.miscInterval;
        this.elements.fillInterval.value = items.fillInterval;
        this.elements.longTimeout.value = items.longTimeout;
      });
    },

    init: function() {
      document.addEventListener('DOMContentLoaded', ()=> this.restore());

      this.elements.enabled.addEventListener('change', ()=> this.save(false));

      this.elements.saveButton.addEventListener('click', ()=> this.save());
      this.elements.defaultButton.addEventListener('click', ()=> this.reset());

      // Play a random commentary when a commentator is selected
      Array.prototype.forEach.call(this.elements.commentators, (item)=> {
        const listener = ()=> Utils.audio.play('misc', item.value, this.elements.volume.value);
        item.addEventListener('click', listener);
      });
    }
  };

  const ctrl = Object.create(OptionsCtrl);
  ctrl.init();
})(browser, Utils);
