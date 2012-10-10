var MockPopupManager = {
  open: function(name, frame, origin) {
    this.mOpened = true;
    this.mName = name;
    this.mFrame = frame;
    this.mOrigin = origin;
  },

  close: function() {
    this.mOpened = false;
  },

  mOpened: false,
  mName: null,
  mFrame: null,
  mOrigin: null,
  mTrusted: null,
  mTearDown: function tearDown() {
    this.mOpened = true;
    this.mName = null;
    this.mFrame = null;
    this.mOrigin = null;
  }
};
