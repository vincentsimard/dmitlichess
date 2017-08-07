// from https://developer.chrome.com/extensions/options

// Saves options to chrome.storage
function saveOptions() {
  var volume = document.getElementById('volume').value;
  var commentator = document.querySelector('input[name="commentator"]:checked').value;
  var miscInterval = document.getElementById('miscInterval').value;
  var fillInterval = document.getElementById('fillInterval').value;
  var longTimeout = document.getElementById('longTimeout').value;

  chrome.storage.sync.set({
    volume: volume,
    commentator: commentator,
    miscInterval: miscInterval,
    fillInterval: fillInterval,
    longTimeout: longTimeout
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved. Please refresh your lichess.org window/tab';

    setTimeout(function() { status.textContent = ''; }, 5000);

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
var defaultButton = document.getElementById('default')

document.addEventListener('DOMContentLoaded', restoreOptions);
if (saveButton) { saveButton.addEventListener('click', saveOptions); }
if (defaultButton) { defaultButton.addEventListener('click', resetOptions); }
