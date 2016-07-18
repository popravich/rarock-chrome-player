// use strict

(function () {
  init();

  function init() {
    const STREAM = 'http://stream.rarock.com';
    
    var ctx = document.querySelector('div.container');
    var play = document.getElementById('play-btn');
    var stop = document.getElementById('stop-btn');

    var player; // = chrome.extension.getBackgroundPage();

    play.addEventListener('click', function(e) {
      if(!player.isPlaying()) {
        player.play(STREAM).then(function() {
          setState(player.isPlaying());
        });
        setState(true);
        setStateText("Loading...");
      }
    })

    stop.addEventListener('click', function(e) {
      if(player.isPlaying()) {
        player.stop();
        setState(false);
        setStateText("Stopped");
      }
    });

    getPlayer().then((p) => {
      player = p;
      setState(player.isPlaying());
    });

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

  }

  function getPlayer() {
    return new Promise((resolve, reject) => {
      chrome.runtime.getBackgroundPage((page) => resolve(page));
    });
  }
})()
