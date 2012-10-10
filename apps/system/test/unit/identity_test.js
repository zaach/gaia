requireApp('system/js/identity.js');
requireApp('system/test/unit/mock_chrome_event.js');
requireApp('system/test/unit/mock_popup_manager.js');

// ensure its defined as a global so mocha will not complain about us
// leaking new global variables during the test
if (!window.PopupManager) {
  window.PopupManager = true;
}

suite('identity', function() {
  var subject;
  var realPopupManager;
  var realDispatchEvent;

  var lastDispatchedEvent = null;

  suiteSetup(function() {
    subject = Identity;
    realPopupManager = window.PopupManager;
    window.PopupManager = MockPopupManager;

    realDispatchEvent = subject._dispatchEvent;
    subject._dispatchEvent = function (obj) {
      lastDispatchedEvent = obj;
    };
  });

  suiteTeardown(function() {
    window.PopupManager = realPopupManager;
    subject._dispatchEvent = realDispatchEvent;
  });

  setup(function() {});

  teardown(function() {
    MockPopupManager.mTearDown();
  });

  suite('open popup', function() {
    setup(function() {
      var event = new MockChromeEvent({
        type: 'open-id-dialog',
        id: 'test-open-event-id'
      });
      subject.handleEvent(event);
    });

    test('popup parameters', function() {
      assert.equal(true, MockPopupManager.mOpened);
      assert.equal('IdentityFlow', MockPopupManager.mName);
      assert.equal('https://login.persona.org/sign_in#NATIVE', MockPopupManager.mOrigin);
      assert.equal('https://login.persona.org/sign_in#NATIVE', MockPopupManager.mFrame.src);
    });

    test('frame event listener', function() {
      var frame = MockPopupManager.mFrame;
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('mozbrowserloadstart', true, true, {target: frame});
      frame.dispatchEvent(event);

      assert.equal(frame, lastDispatchedEvent.frame);
      assert.equal('test-open-event-id', lastDispatchedEvent.id);
    });
  });

  suite('close popup', function() {
    setup(function() {
      var event = new MockChromeEvent({
        type: 'close-id-dialog',
        id: 'test-close-event-id'
      });
      subject.handleEvent(event);
    });

    test('close', function() {
      assert.equal(false, MockPopupManager.mOpened);
      assert.equal('test-close-event-id', lastDispatchedEvent.id);
    });
  });
});

