/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

const kIdentityScreen = 'https://login.persona.org/sign_in#NATIVE';

var Identity = {
  chromeEventId: null,

  init: function() {
    window.addEventListener('mozChromeEvent', this);
  },

  handleEvent: function onMozChromeEvent(e) {
    // We save the mozChromeEvent identifiers to send replies back from content
    // with this exact value.
    this.chromeEventId = e.detail.id;
    if (!this.chromeEventId)
      return;

    switch (e.detail.type) {
      // Chrome asks Gaia to show the identity dialog.
      case 'open-id-dialog':
        var frame = document.createElement('iframe');
        frame.setAttribute('mozbrowser', 'true');
        frame.classList.add('screen');
        frame.src = kIdentityScreen;
        frame.addEventListener('mozbrowserloadstart', function loadStart(evt) {
          // After creating the new frame containing the identity
          // flow, we send it back to chrome so the identity callbacks can be
          // injected.
          this._dispatchEvent({
            id: this.chromeEventId,
            frame: evt.target
          });
        }.bind(this));

        // The identity flow is shown within the trusted UI.
        PopupManager.open('IdentityFlow', frame, kIdentityScreen, false);
        break;

      case 'close-id-dialog':
        dump("in gaia close dialog");
        PopupManager.close(null);
        this._dispatchEvent({ id: this.chromeEventId });
        break;
    }
  },
  _dispatchEvent: function su_dispatchEvent(obj) {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('mozContentEvent', true, true, obj);
    window.dispatchEvent(event);
  }
};

Identity.init();
