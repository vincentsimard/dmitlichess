(function(chrome) {
  'use strict';

  // Based off https://developer.chrome.com/extensions/options

  // Saves options to chrome.storage
  function saveOptions() {
    chrome.storage.sync.set({
      volume:       document.getElementById('volume').value,
      commentator:  document.querySelector('input[name="commentator"]:checked').value,
      miscInterval: document.getElementById('miscInterval').value,
      fillInterval: document.getElementById('fillInterval').value,
      longTimeout:  document.getElementById('longTimeout').value
    }, function() {
      // Update status to let user know options were saved.
      // @TODO: Figure out a way to apply the options directly
      var status = document.getElementById('status');
      status.textContent = 'Options saved. Please refresh your lichess.org page';
      status.classList.remove = 'fade';

      setTimeout(function() {
        status.classList.add('fade');
      }, 5000);

      // @TODO: Would be nice but icon reverts back when reloading browser
      // chrome.browserAction.setIcon({ path : '/images/' + commentator + '.png' });
    });
  }

  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restoreOptions() {
    // Default values
    chrome.storage.sync.get({
      volume: 100,
      commentator: 'dmitri',
      miscInterval: 10000,
      fillInterval: 17000,
      longTimeout: 3600
    }, function(items) {
      document.getElementById('volume').value = items.volume;
      document.getElementById('commentator_' + items.commentator).checked = true;
      document.getElementById('miscInterval').value = items.miscInterval;
      document.getElementById('fillInterval').value = items.fillInterval;
      document.getElementById('longTimeout').value = items.longTimeout;
    });
  }

  function resetOptions() {
    document.getElementById('commentator_dmitri').checked = true;
    document.getElementById('miscInterval').value = 10000;
    document.getElementById('fillInterval').value = 17000;
    document.getElementById('longTimeout').value = 3600;

    saveOptions();
  }

  var saveButton = document.getElementById('save');
  var defaultButton = document.getElementById('default');

  document.addEventListener('DOMContentLoaded', restoreOptions);
  if (saveButton) { saveButton.addEventListener('click', saveOptions); }
  if (defaultButton) { defaultButton.addEventListener('click', resetOptions); }
})(chrome);
