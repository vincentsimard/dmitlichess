// from https://developer.chrome.com/extensions/options

// Saves options to chrome.storage
function saveOptions() {
  var volume = document.getElementById('volume').value;
  var miscInterval = document.getElementById('miscInterval').value;
  var yesInterval = document.getElementById('yesInterval').value;
  var longTimeout = document.getElementById('longTimeout').value;

  chrome.storage.sync.set({
    volume: volume,
    miscInterval: miscInterval,
    yesInterval: yesInterval,
    longTimeout: longTimeout
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved. Changes will be applied the next time lichess is loaded.';
    setTimeout(function() { status.textContent = ''; }, 5000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    volume: 100,
    miscInterval: 15000,
    yesInterval: 13000,
    longTimeout: 3600
  }, function(items) {
    document.getElementById('volume').value = items.volume;
    document.getElementById('miscInterval').value = items.miscInterval;
    document.getElementById('yesInterval').value = items.yesInterval;
    document.getElementById('longTimeout').value = items.longTimeout;
  });
}

function resetOptions() {
  document.getElementById('miscInterval').value = 15000;
  document.getElementById('yesInterval').value = 13000;
  document.getElementById('longTimeout').value = 3600;

  saveOptions();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('default').addEventListener('click', resetOptions);
