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

class Channel {

  constructor(side) {
    this._port = null;
    this._requests = {};
    this._id = 0;
    this._listeners = {};
    if (side === CHANNEL_BACKGROUND)
      chrome.runtime.onConnect.addListener((p) => this._connect(p));
    else if (side === CHANNEL_POPUP)
      this._connect(chrome.runtime.connect());
  }

  _connect(port) {
    if (this._port !== null)
      this._port.disconnect();

    this._port = port;
    var on_message = (...args) => this._dispatch(...args);
    var on_disconnect = (...args) => {
      port.onMessage.removeListener(on_message);
      port.onDisconnect.removeListener(on_disconnect);
      if (this._port === port)
        this._port = null;
    }
    port.onMessage.addListener(on_message);
    port.onDisconnect.addListener(on_disconnect);
  }

  _dispatch(message, sender, ...args) {
    // console.log("GOT MESSAGE:", message);
    if (this._listeners[message.type] !== undefined) {
      try {
        let callback = this._listeners[message.type];
        let res = callback(message.payload);
        if (message.id !== null)
          sender.postMessage({ok: true, id: message.id, payload: res});
      } catch (e) {
        if (message.id !== null)
          sender.postMessage({ok: false, id: message.id, error: e.toString()});
      }
    } else {
      if (message.id === null)
        return;
      if (this._requests[message.id] === undefined) {
        sender.postMessage({ok: false, id: message.id, error: 'No listener'})
      } else {
        if (message.ok)
          this._requests[message.id].resolve(message.payload);
        else
          this._requests[message.id].reject(message.error);
        delete this._requests[message.id];
      }
    }
  }

  request(type, payload) {
    if (this._port === null)
      return Promise.reject('Not connected');
    return new Promise((resolve, reject) => {
      let id = ++this._id;
      this._requests[id] = {resolve, reject}
      try {
        this._port.postMessage({id, payload, type});
      } catch (e) {
        delete this._requests[id];
        reject(e.toString());
      }
    });
  }

  notify(type, payload) {
    if (this._port === null) {
      console.log("Not connected");
      return;
    }
    this._port.postMessage({id: null, payload, type})
  }

  addListener(type, callback) {
    this._listeners[type] = callback;
  }
}
