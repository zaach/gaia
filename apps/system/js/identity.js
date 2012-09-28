/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

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
        frame.src = 'http://cnn.com';//e.detail.uri;
        frame.addEventListener('mozbrowserloadstart', function loadStart(evt) {
          // After creating the new frame containing the identity
          // flow, we send it back to chrome so the identity callbacks can be
          // injected.
          var event = document.createEvent('CustomEvent');
          event.initCustomEvent('mozContentEvent', true, true, {
            id: chromeEventId,
            frame: evt.target
          });
          window.dispatchEvent(event);
        });

        // The identity flow is shown within the trusted UI.
        PopupManager.open('IdentityFlow', frame, 'http://cnn.com', true);
        break;

      case 'close-id-dialog':
        PopupManager.close(null, function dialogClosed() {
          var event = document.createEvent('customEvent');
          event.initCustomEvent('mozContentEvent', true, true,
                                { id: chromeEventId });
          window.dispatchEvent(event);
        });
        break;
    }
  });
})();
