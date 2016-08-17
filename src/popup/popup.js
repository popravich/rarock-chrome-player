// use strict

(function () {
  init();

  function init() {
    const STREAM = 'http://stream.rarock.com';

    let ctx = document.querySelector('div.container');
    let play = ctx.querySelector('a.play');
    let stop = ctx.querySelector('a.pause');
    let loader = ctx.querySelector('div.progress');
    let volume = ctx.querySelector('input.volume');
    let mute = ctx.querySelector('a.mute');
    let loud = ctx.querySelector('a.loud');

    var client = new Channel(CHANNEL_POPUP);

    client.addListener('stateChange', changeState);
    client.request('getState').then(changeState).catch((e) => console.log("error:", e))
    client.notify('volume', volume.value);

    play.addEventListener('click', (e) => {
      loader.classList.add('play');
      client.notify('play', STREAM)
    });

    stop.addEventListener('click', (e) => client.notify('stop'));

    loader.addEventListener('webkitTransitionEnd', (e) => {
      if(e.target.style.width == "100%")
        e.target.classList.remove('play');
    })

    volume.addEventListener('change', (e) => {
      client.notify('volume', e.target.value);
    });
    volume.addEventListener('input', (e) => {
      client.notify('volume', e.target.value);
    });
    mute.addEventListener('click', e => {
      volume.value = 0;
      client.notify('volume', 0);
    });
    loud.addEventListener('click', e => {
      volume.value = 100;
      client.notify('volume', 100);
    });

    // var settings = ctx.querySelector('a.settings');
    // settings.addEventListener('click', (e) => alert("Settings"));

    function setState(state) {
      if (state) {
        ctx.classList.add('state-playing');
        ctx.classList.remove('state-stopped');
        setStateText("Playing...");
      } else {
        ctx.classList.remove('state-playing');
        ctx.classList.add('state-stopped');
        setStateText("Stopped");
      }
    }

    function setStateText(text) {
      document.getElementById('status').innerText = text;
    }

    function changeState(newState) {
      if (newState < STATE_PLAY_STARTING) {
        setState(false);
        setStateText('Stopped');
        loader.style.width = "25%";
      } else if (newState < STATE_WAITING) {
        loader.style.width = "50%";
      } else if (newState < STATE_PLAYING) {
        setState(true);
        setStateText('Loading...');
        loader.style.width = "75%";
      } else {
        setState(true);
        setStateText('Playing...');
        loader.style.width = "100%";
      }
    }

  }

})()
