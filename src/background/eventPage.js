// use strict;


const EVENT_PLAY = 'play';
const EVENT_PLAYING = 'playing';
const EVENT_WAITING = 'waiting';
const EVENT_EMPTIED = 'emptied';
const EVENT_STALLED = 'stalled';
const EVENT_LOADEDDATA = 'loadeddata';
const EVENT_LOADEDMETADATA = 'loadedmetadata';

const _TYPES_MAP = {};
_TYPES_MAP[EVENT_PLAY] = STATE_PLAY_STARTING;
_TYPES_MAP[EVENT_PLAYING] = STATE_PLAYING;
_TYPES_MAP[EVENT_WAITING] = STATE_WAITING;
_TYPES_MAP[EVENT_EMPTIED] = STATE_PAUSED;
_TYPES_MAP[EVENT_STALLED] = STATE_ERRORED;


class Player {
  constructor() {
    // XXX: revise using `new Audio()`;
    this._state = STATE_PAUSED;
    this._state_callback = null;

    this._audio = document.querySelector('audio');
    if (this._audio === null) {
      this._audio = document.createElement('audio');
      document.body.appendChild(this._audio);
    }
    this._audio.addEventListener(EVENT_PLAY, (e) => this._handle(e))
    this._audio.addEventListener(EVENT_PLAYING, (e) => this._handle(e))
    this._audio.addEventListener(EVENT_WAITING, (e) => this._handle(e))
    this._audio.addEventListener(EVENT_EMPTIED, (e) => this._handle(e))
    this._audio.addEventListener(EVENT_STALLED, (e) => this._handle(e))
    this._audio.addEventListener(EVENT_LOADEDDATA, (e) => this._handle(e))
    this._audio.addEventListener(EVENT_LOADEDMETADATA, (e) => this._handle(e))
  }

  _handle(e) {
    if (_TYPES_MAP[e.type] !== undefined)
      this._state = _TYPES_MAP[e.type];
    if (this._state_callback !== null) {
      this._state_callback(this._state);
    }
    if (this._state === STATE_PLAYING) {
      chrome.browserAction.setIcon({
        path: {
          '19': 'assets/action_green_19.png',
          '38': 'assets/action_green_38.png',
        }
      })
    } else {
      chrome.browserAction.setIcon({
        path: {
          '19': 'assets/action_dark_19.png',
          '38': 'assets/action_dark_38.png',
        }
      })
    }
  }

  onStateChange(callback) {
    this._state_callback = callback;
  }

  play(url) {
    this._audio.src = url;
    this._audio.load();
    return this._audio.play();
  }
  stop() {
    this._audio.src = "";
    this._audio.load();
  }

  isPlaying() {
    if (this._audio.networkState == this._audio.NETWORK_EMPTY ||
        this._audio.networkState == this._audio.NETWORK_NO_SOURCE)
      return false;
    if (this._audio.readyState < this._audio.HAVE_CURRENT_DATA)
      return false;
    return !this._audio.paused;
  }

  get state() { return this._state; }

  volume(val) {
    this._audio.volume = val / 100;
    return
  }
}

var srv = new Channel(CHANNEL_BACKGROUND);
var player = new Player();

player.onStateChange((state) => srv.notify('stateChange', state));
srv.addListener('play', (url) => player.play(url));
srv.addListener('stop', () => player.stop());
srv.addListener('isPlaying', () => {return player.isPlaying()});
srv.addListener('getState', () => {return player.state});
srv.addListener('volume', (value) => player.volume(value));

