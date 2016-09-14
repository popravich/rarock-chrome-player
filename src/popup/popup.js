// use strict

(function () {
  init();

  function init() {
    const STREAM = 'http://stream.rarock.com';

    let ctx = document.querySelector('main');
    let play = ctx.querySelector('.controls-play');
    // let stop = ctx.querySelector('.play');
    let loader = ctx.querySelector('.progress');
    let volume = ctx.querySelector('input.volume');
    let mute = ctx.querySelector('.mute');
    let loud = ctx.querySelector('.loud');
    let info = ctx.querySelector('.now-playing')

    var client = new Channel(CHANNEL_POPUP);

    client.addListener('stateChange', changeState);
    client.request('getState').then(changeState).catch((e) => console.log("error:", e))
    volume.value = getVolume();
    volume.title = getVolume();
    client.notify('volume', volume.value);

    play.addEventListener('click', (e) => {
      if (play.classList.contains('controls-play--play')) {
        loader.classList.remove('progress--hide');
        client.notify('play', STREAM);
      } else {
        client.notify('stop');
      }
    });

    // stop.addEventListener('click', (e) => client.notify('stop'));

    volume.addEventListener('change', (e) => {
      setVolume(e.target.value);
    });
    volume.addEventListener('input', (e) => {
      setVolume(e.target.value);
    });
    mute.classList.add('mute--' + (localStorage.getItem('volume:mute') || 'off'));
    mute.addEventListener('click', e => {
      if (mute.classList.contains('mute--off')) {
        mute.classList.add('mute--on');
        mute.classList.remove('mute--off');
        localStorage.setItem('volume:mute', 'on');
        client.notify('volume', 0);
      } else {
        mute.classList.add('mute--off');
        mute.classList.remove('mute--on');
        localStorage.setItem('volume:mute', 'off');
        client.notify('volume', volume.value);
      }
    });

    function setVolume(value) {
      mute.classList.remove('mute--on');
      mute.classList.add('mute--off');
      localStorage.setItem('volume', value);
      client.notify('volume', value);
    }
    function getVolume() {
      return Number.parseInt(localStorage.getItem('volume') || '50');
    }
    function muteVolume(mute) {
      client.notify('volume', 0);
    }

    // var settings = ctx.querySelector('a.settings');
    // settings.addEventListener('click', (e) => alert("Settings"));

    function setState(state) {
      if (state) {
        // ctx.classList.add('state-playing');
        // ctx.classList.remove('state-stopped');
        setStateText("Playing...");
        play.classList.add('controls-play--pause');
        play.classList.remove('controls-play--play');
      } else {
        // ctx.classList.remove('state-playing');
        // ctx.classList.add('state-stopped');
        setStateText("Stopped");
        play.classList.remove('controls-play--pause');
        play.classList.add('controls-play--play');
      }
    }

    function setStateText(text) {
      console.log("state:", text);
    }

    function changeState(newState) {
      if (newState < STATE_PLAY_STARTING) {
        setState(false);
        setStateText('Stopped');
      } else if (newState < STATE_WAITING) {
        // pass
      } else if (newState < STATE_PLAYING) {
        setState(true);
        setStateText('Loading...');
      } else {
        setState(true);
        setStateText('Playing...');
        loader.classList.add('progress--hide');
      }
    }

  }

})()
