document.addEventListener('DOMContentLoaded', (ev) => {

  let CtlStream = new Rx.Subject();
  let RespStream = new Rx.Subject();
  CtlStream.subscribe(
    data => console.log("ctl message:", data),
    err => console.log("ctl error:", err));
  RespStream.subscribe(
    data => console.log("resp message:", data),
    err => console.log("resp err:", err));

  UI_init(CtlStream, RespStream);
  Port_init(CtlStream, RespStream, CHANNEL_POPUP);
});


function UI_init(CtlStream, RespStream) {
  let progress = document.querySelector('div.ui-progress');
  let playBtn = document.querySelector('button.ui-play');
  let volumeSlider = document.querySelector('input.ui-volume');

  Rx.Observable.fromEvent(playBtn, 'click', (e) => {
    if (playBtn.classList.contains('ui-play--play')) {
      return { type: 'setPlay', mode: 'play' , url: "http://stream.rarock.com"};
    } else {
      return { type: 'setPlay', mode: 'stop' };
    }
  }).subscribe(CtlStream);

  let setPlayState = RespStream.filter(ev => ev.type == 'setPlayState');
  let play_state = setPlayState.filter(({cur_state}) => cur_state == 'play' || cur_state == 'waiting');
  play_state.subscribe(() => {
    progress.classList.add('ui-progress--show');
    progress.classList.remove('ui-progress--hide');
  });
  play_state.subscribe(() => {
    playBtn.classList.remove('ui-play--play');
    playBtn.classList.add('ui-play--pause');
  });

  let playing_state = setPlayState.filter(ev => ev.cur_state == 'playing');
  playing_state.subscribe(() => {
    progress.classList.remove('ui-progress--show');
    progress.classList.add('ui-progress--hide');
  });
  playing_state.subscribe(() => {
    playBtn.classList.remove('ui-play--play');
    playBtn.classList.add('ui-play--pause');
  });
  let empty_state = setPlayState.filter(ev => ev.cur_state == 'emptied')
  empty_state.subscribe(() => {
    playBtn.classList.add('ui-play--play');
    playBtn.classList.remove('ui-play--pause');
  });
  empty_state.subscribe(() => {
    progress.classList.remove('ui-progress--show');
    progress.classList.add('ui-progress--hide');
  });

  // Rx.Observable.fromEvent(volumeSlider, 'change', (e) => {
  //   return { type: 'ui', el: 'volume', value: Number(e.target.value) };
  // }).subscribe(subj);
  Rx.Observable.fromEvent(volumeSlider, 'input', (e) => {
    return { type: 'setVolume', volume: Number(e.target.value) };
  }).subscribe(CtlStream);
}
