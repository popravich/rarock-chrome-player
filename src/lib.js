/* payer state constants */

const STATE_PAUSED = 0;         // no source; initial state
const STATE_ERRORED = 1;        // error occurred (eg, stalled)
const STATE_PLAY_STARTING = 2;  // play pressed; data is loading
const STATE_WAITING = 3;        // data is loading (buffering)
const STATE_PLAYING = 4;        // playing

/*
  State transitins:

    STATE_PAUSED -> STATE_PLAY_STARTING -> STATE_WAITING
       ^                                    ^     |
       |                .----------------->-*-----|
       '----------- STATE_PLAYING <---------------|
       ^                |                         |
       |                V                         |
       '----------- STATE_ERRORED <---------------'
*/


/*
  Port wrapper for communication between popup & background pages;
*/

const CHANNEL_POPUP = 0;
const CHANNEL_BACKGROUND = 1;

const EID = "mbdcndcgomkbohfobgommopaaemajmko";


function Port_init(ctlStream, respStream, type, extId=EID) {
  function _connect(port) {
    let sub = new Rx.Subject();
    let onMessage = msg => sub.onNext(msg);
    let onPostMessage = msg => port.postMessage(msg);
    port.onMessage.addListener(onMessage);
    sub.subscribe(respStream);
    let disp = ctlStream.subscribe(onPostMessage);
    let onDisconnect = () => {
      port.onMessage.removeListener(onMessage);
      port.onDisconnect.removeListener(onDisconnect);
      disp.dispose();
      sub.dispose();
    };
    port.onDisconnect.addListener(onDisconnect);
    respStream.onNext({
      type: 'portConnected'
    });
  }

  switch (type) {
  case CHANNEL_BACKGROUND:
    chrome.runtime.onConnect.addListener(p => _connect(p));
    return;
  case CHANNEL_POPUP:
    let port = chrome.runtime.connect(extId);
    _connect(port);
    port.onDisconnect.addListener(() => console.log("disconnected"));
    return;
  default:
    throw new Error("Invalid type");
  }
}
