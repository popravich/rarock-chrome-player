// use strict;


function isPlaying() {
  var a = _audio();
  if (a.networkState == a.NETWORK_EMPTY ||
      a.networkState == a.NETWORK_NO_SOURCE)
    return false;
  if (a.readyState < a.HAVE_CURRENT_DATA)
    return false;
  return !a.paused;
}

function play(url) {
  var a = _audio();
  a.src = url;
  a.load();
  return a.play();
}

function stop() {
  var a = _audio();
  a.src = "";
  a.load();
}

function _audio() {
  var a = document.querySelector('audio');
  if (a === null) {
    a = document.createElement('audio');
    document.body.appendChild(a);
  }
  return a;
}


// TODO: handle events
