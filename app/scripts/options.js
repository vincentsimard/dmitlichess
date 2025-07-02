'use strict';

class OptionsCtrl {
  constructor() {
    this.elements = {
      commentators: document.querySelectorAll('input[name="commentator"]'),
      defaultButton: document.getElementById('default'),
      enabled: document.getElementById('enabled'),
      fillInterval: document.getElementById('fillInterval'),
      longTimeout: document.getElementById('longTimeout'),
      miscInterval: document.getElementById('miscInterval'),
      status: document.getElementById('status'),
      volume: document.getElementById('volume'),
    };
  }

  save = (showStatus = true) => {
    const doSaved = () => {
      if (showStatus && this.elements.status) {
        this.elements.status.textContent = '✔ Your preferences have been saved.';
        this.elements.status.classList.remove('faded');
        
        setTimeout(() => this.elements.status.classList.add('faded'), 5000);
      }
    };

    UserPrefs.saveOptions({
      commentator:  document.querySelector('input[name="commentator"]:checked').value,
      enabled:      this.elements.enabled.checked,
      volume:       this.elements.volume.value,
      miscInterval: this.elements.miscInterval.value,
      fillInterval: this.elements.fillInterval.value,
      longTimeout:  this.elements.longTimeout.value
    }).then(doSaved);
  };

  reset = () => {
    const defaults = UserPrefs.defaults;

    document.getElementById(`commentator_${defaults.commentator}`).checked = true;
    this.elements.enabled.checked = defaults.enabled;
    this.elements.miscInterval.value = defaults.miscInterval;
    this.elements.fillInterval.value = defaults.fillInterval;
    this.elements.longTimeout.value = defaults.longTimeout;
  
    this.save();
  };

  // Restores select box and checkbox state using the preferences storage.
  restore = (options) => {
    document.getElementById(`commentator_${options.commentator}`).checked = true;
    this.elements.enabled.checked = options.enabled;
    this.elements.volume.value = options.volume;
    this.elements.miscInterval.value = options.miscInterval;
    this.elements.fillInterval.value = options.fillInterval;
    this.elements.longTimeout.value = options.longTimeout;
  };

  createCommentatorOption = async (commentator) => {
    const container = document.querySelector('.commentator_radio');
    if (!container) return;

    const url = chrome.runtime.getURL(`ogg/${commentator}/meta.json`);
    const response = await fetch(url);
    const json = await response.json();
    const { icon = 'default-icon.png', name = 'tooltip' } = json;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'commentator';
    input.value = commentator;
    input.id = `commentator_${commentator}`;
    input.setAttribute('data-saveOn', 'click');

    const label = document.createElement('label');
    label.setAttribute('for', input.id);
    label.setAttribute('data-tooltip', name);

    const img = document.createElement('img');
    img.src = `images/${icon}`;
    label.appendChild(img);

    container.appendChild(input);
    container.appendChild(label);
  };

  createCommentatorOptions = async (commentators) => {
    const container = document.querySelector('.commentator_radio');
    if (!container) return;

    container.innerHTML = ''; // Optional: clear existing content

    await Promise.all(commentators.map(commentator =>
      this.createCommentatorOption(commentator)
    ));

    this.elements.commentators = document.querySelectorAll('input[name="commentator"]');
  };

  bindEventListeners = () => {
    this.elements.defaultButton?.addEventListener('click', () => this.reset());

    this.elements.enabled?.addEventListener('change', () => this.save(false));

    document.querySelectorAll('[data-saveOn]').forEach(el => {
      el.addEventListener(el.getAttribute('data-saveOn'), () => this.save());
    });

    document.querySelectorAll('.links').forEach(el => {
      el.addEventListener('click', event => {
        event.preventDefault();
        const url = event.target?.href;
        if (url) chrome.tabs.create({ url });
      });
    });

    // Play a random commentary when a commentator is selected
    // @TODO: Create commentators select elements based on manifests?
    this.elements.commentators?.forEach(item => {
      const commentator = item.value;
      const url = chrome.runtime.getURL(`ogg/${commentator}/meta.json`);

      fetch(url)
        .then(response => response.json())
        .then(json => {
          const sounds = { [commentator]: json.sounds };
          item.addEventListener('click', () => {
            AudioUtils.play(sounds, 'misc', commentator, this.elements.volume?.value);
          });
        });
    });
  };

  init = () => {
    document.addEventListener('DOMContentLoaded', () => this._initAsync());
  };

  _initAsync = async () => {
    try {
      const items = await UserPrefs.getOptions();
      await this.createCommentatorOptions(items.commentators);
      this.restore(items);
      this.bindEventListeners();
    } catch (error) {
      console.error('Error initializing options:', error);
    }
  };
}

window.optionsCtrl = new OptionsCtrl();
window.optionsCtrl.init();
