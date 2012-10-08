/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

const kIdentityScreen = 'https://login.persona.org/sign_in#NATIVE';

var Identity = (function Identity() {
  var chromeEventId = null;

  window.addEventListener('mozChromeEvent', function onMozChromeEvent(e) {
    // We save the mozChromeEvent identifiers to send replies back from content
    // with this exact value.
    chromeEventId = e.detail.id;
    if (!chromeEventId)
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
          var event = document.createEvent('CustomEvent');
          event.initCustomEvent('mozContentEvent', true, true, {
            id: chromeEventId,
            frame: evt.target
          });

          dump("about to dispatch event from gaia");
          dump(event);
          window.dispatchEvent(event);
        });

        // The identity flow is shown within the trusted UI.
        PopupManager.open('IdentityFlow', frame, kIdentityScreen, false);
        break;

      case 'close-id-dialog':
        dump("in gaia close dialog");
        PopupManager.close(null);
        var event = document.createEvent('customEvent');
        event.initCustomEvent('mozContentEvent', true, true,
                              { id: chromeEventId });
        window.dispatchEvent(event);
        break;
    }
  });
})();
