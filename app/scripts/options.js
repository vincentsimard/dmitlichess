'use strict';

class OptionsCtrl {
  constructor() {
    this.elements = {
      enabled: document.getElementById('enabled'),
      volume: document.getElementById('volume'),
      commentators: document.querySelectorAll('input[name="commentator"]'),
      miscInterval: document.getElementById('miscInterval'),
      fillInterval: document.getElementById('fillInterval'),
      longTimeout: document.getElementById('longTimeout'),
      status: document.getElementById('status'),
      defaultButton: document.getElementById('default')
    };
  }

  save(showStatus = true) {
    const doSaved = () => {
      if (showStatus) {
        // Update status to let user know options were saved.
        const status = this.elements.status;

        status.textContent = '\u2714 Your preferences have been saved.';
        status.classList.remove('faded');

        setTimeout(() => status.classList.add('faded'), 5000);
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
  }

  reset() {
    document.getElementById('commentator_' + UserPrefs.defaults.commentator).checked = true;
    this.elements.enabled.checked = UserPrefs.defaults.enabled;
    this.elements.miscInterval.value = UserPrefs.defaults.miscInterval;
    this.elements.fillInterval.value = UserPrefs.defaults.fillInterval;
    this.elements.longTimeout.value = UserPrefs.defaults.longTimeout;

    this.save();
  }

  // Restores select box and checkbox state using the preferences storage.
  restore(options) {
    document.getElementById('commentator_' + options.commentator).checked = true;
    this.elements.enabled.checked = options.enabled;
    this.elements.volume.value = options.volume;
    this.elements.miscInterval.value = options.miscInterval;
    this.elements.fillInterval.value = options.fillInterval;
    this.elements.longTimeout.value = options.longTimeout;
  }

  createCommentatorOptions(commentators) {
    const container = document.querySelector('.commentator_radio');

    const createCommentatorOptionPromises = commentators.map(commentator => {
      const url = chrome.runtime.getURL(`ogg/${commentator}/manifest.json`);

      return fetch(url)
        .then((response) => response.json())
        .then(json => {
          const {icon, name = 'tooltip'} = json;

          const input = document.createElement('input');
          input.type = 'radio';
          input.name = 'commentator';
          input.value = commentator;
          input.id = `commentator_${commentator}`;
          input.setAttribute('data-saveOn', 'click');
      
          const label = document.createElement('label');
          label.setAttribute('for', `commentator_${commentator}`);
          label.setAttribute('data-tooltip', name);
  
          const img = document.createElement('img');
          img.src = `images/${icon}`;
  
          label.appendChild(img);

          let added = false;

          container.childNodes.forEach(node => {
            if (node.type !== 'radio') { return; }
            if (node.value < commentator) { return; }

            container.insertBefore(label, node);
            container.insertBefore(input, label);

            added = true;
          });

          if (!added) {
            container.appendChild(label);
            container.insertBefore(input, label);
          }
        });
    });

    return Promise.all(createCommentatorOptionPromises);
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      UserPrefs.getOptions().then(items => {
        this.createCommentatorOptions(items.commentators).then(() => {
          this.restore(items);
    
          this.elements.defaultButton.addEventListener('click', () => this.reset());
      
          this.elements.enabled.addEventListener('change', () => this.save(false));
          document.querySelectorAll('[data-saveOn]').forEach(el => {
            el.addEventListener(el.getAttribute('data-saveOn'), () => { this.save(); });
          });
      
          document.querySelectorAll('.links').forEach(el => {
            el.addEventListener('click', event => {
              event.preventDefault();
      
              if (event.target.href === undefined) { return; }
      
              chrome.tabs.create({ url: event.target.href });
            });
          });
      
          // Play a random commentary when a commentator is selected
          // @TODO: Create commentators select elements based on manifests?
          this.elements.commentators.forEach(item => {
            const commentator = item.value;
      
            const url = chrome.runtime.getURL(`ogg/${commentator}/manifest.json`);
            fetch(url)
              .then((response) => response.json())
              .then((json) => {
                const sounds = {};
      
                sounds[commentator] = json.sounds;
      
                const listener = () => AudioUtils.play(sounds, 'misc', commentator, this.elements.volume.value);
                item.addEventListener('click', listener);
              });
          });
        });
      });
    });
  }
}

window.optionsCtrl = new OptionsCtrl();
window.optionsCtrl.init();
