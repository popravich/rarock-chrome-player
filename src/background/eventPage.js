// use strict;


const EVENT_PLAY = 'play';
const EVENT_PLAYING = 'playing';
const EVENT_WAITING = 'waiting';
const EVENT_EMPTIED = 'emptied';
const EVENT_STALLED = 'stalled';
const EVENT_LOADEDDATA = 'loadeddata';
const EVENT_LOADEDMETADATA = 'loadedmetadata';


class Player {
  constructor(ctlStream) {
    // XXX: revise using `new Audio()`;
    this._state = STATE_PAUSED;
    this._state_callback = null;

    this._audio = document.querySelector('audio');
    if (this._audio === null) {
      this._audio = document.createElement('audio');
      document.body.appendChild(this._audio);
    }
    this._stream = Rx.Observable.merge(
      Rx.Observable.fromEvent(this._audio, EVENT_PLAY),
      Rx.Observable.fromEvent(this._audio, EVENT_PLAYING),
      Rx.Observable.fromEvent(this._audio, EVENT_WAITING),
      Rx.Observable.fromEvent(this._audio, EVENT_EMPTIED),
      Rx.Observable.fromEvent(this._audio, EVENT_STALLED)
      );
    this._stream.map(ev => {
        let old_state = this._state;
        let cur_state = ev.type;
        this._state = cur_state;
        return {type: 'setPlayState', cur_state, old_state};
      }).subscribe(ctlStream);

    this._setIcon();
  }

  _setIcon() { 
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

  play(url) {
    this._audio.src = url;
    this._audio.load();
    return this._audio.play();
  }
  stop() {
    this._audio.src = "";
    this._audio.load();
  }

  volume(val) {
    this._audio.volume = val / 100;
    return
  }
}

var CtlStream = new Rx.Subject();
var RespStream = new Rx.Subject();

CtlStream.subscribe(msg => console.log("CtlStream:", msg));
RespStream.subscribe(msg => console.log("respStream:", msg));

let playStream = RespStream.filter(msg => msg.type == 'setPlay');
playStream.filter(msg => msg.mode == 'play').subscribe(msg => player.play(msg.url));
playStream.filter(msg => msg.mode != 'play').subscribe(() => player.stop())

RespStream
  .filter(msg => msg.type == 'setVolume')
  .subscribe(msg => {
    player.volume(msg.volume)
  })


Port_init(CtlStream, RespStream, CHANNEL_BACKGROUND);

var player = new Player(CtlStream);
