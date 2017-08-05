// from https://developer.chrome.com/extensions/options

// Saves options to chrome.storage
function saveOptions() {
  var volume = document.getElementById('volume').value;
  var commentator = document.getElementById('commentator').value;
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
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Default values
  chrome.storage.sync.get({
    volume: 100,
    commentator: 'dmitri',
    miscInterval: 15000,
    fillInterval: 13000,
    longTimeout: 3600
  }, function(items) {
    document.getElementById('volume').value = items.volume;
    document.getElementById('commentator').value = items.commentator;
    document.getElementById('miscInterval').value = items.miscInterval;
    document.getElementById('fillInterval').value = items.fillInterval;
    document.getElementById('longTimeout').value = items.longTimeout;
  });
}

function resetOptions() {
  document.getElementById('commentator').value = 'dmitri';
  document.getElementById('miscInterval').value = 15000;
  document.getElementById('fillInterval').value = 13000;
  document.getElementById('longTimeout').value = 3600;

  saveOptions();
}

var saveButton = document.getElementById('save');
var defaultButton = document.getElementById('default')

document.addEventListener('DOMContentLoaded', restoreOptions);
if (saveButton) { saveButton.addEventListener('click', saveOptions); }
if (defaultButton) { defaultButton.addEventListener('click', resetOptions); }
