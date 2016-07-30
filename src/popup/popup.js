// use strict

(function () {
  init();

  function init() {
    const STREAM = 'http://stream.rarock.com';

    var ctx = document.querySelector('div.container');
    var play = ctx.querySelector('a.play');
    var stop = ctx.querySelector('a.pause');
    var loader = ctx.querySelector('div.progress');

    var client = new Channel(CHANNEL_POPUP);

    client.addListener('stateChange', changeState);
    client.request('getState').then(changeState).catch((e) => console.log("error:", e))

    play.addEventListener('click', (e) => {
      loader.classList.add('play');
      client.notify('play', STREAM)
    });

    stop.addEventListener('click', (e) => client.notify('stop'));

    loader.addEventListener('webkitTransitionEnd', (e) => {
      if(e.target.style.width == "100%")
        e.target.classList.remove('play');
    })

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
