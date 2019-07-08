const player = document.querySelector(".player");
const video = player.querySelector(".viewer");
const progress = player.querySelector(".progress");
const progressBar = player.querySelector(".progress__filled");
const toggle = player.querySelector(".toggle");
const skipButtons = player.querySelectorAll("[data-skip]");
const ranges = player.querySelectorAll(".player__slider");
const fullscreenButton = player.querySelector(".fullscreen__button");

function togglePlay(e) {
  const method = video.paused ? "play" : "pause";
  video[method](); // video.play() или video.pause() -> нативные методы html-элемента video
}

function updateButton(e) {
  const icon = this.paused ? "►" : "❚❚";
  toggle.textContent = icon;
}

function spaceHandler(e) {
  if (e.code === "Space") {
    togglePlay();
  }
}

function skip(e) {
  // console.log(e.target.dataset.skip);
  // console.dir(this.dataset.skip);
  const skipTime = this.dataset.skip; // -10 или 25
  video.currentTime += parseFloat(skipTime); // video.currentTime -> нативное свойство html-элемента video
}

function handleRangeUpdate(e) {
  const { name, value } = this;
  // console.log(`${name}: ${value}`);
  video[name] = value; // video.volume = value или video.playbackRate = value -> нативные свойства html-элемента video
}

function handleProgress(e) {
  const percent = (video.currentTime / video.duration) * 100; // сколько видео воспроизвелось на данный момент в процентах, текущий прогресс
  // console.log(percent);
  progressBar.style.flexBasis = `${percent}%`; // для заглушки в css у нас установлено 50%, а сейчас мы динамически меняем этот размер из js
}

// устанавливаем прогресс видео указателем мыши при клике
function scrub(e) {
  // offsetX — свойство события мыши, возвращает расстояние от «начала» элемента до позиции указателя мыши по координате X
  // offsetWidth — возвращает ширину элемента

  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration; // время в которое нужно перемотать, тоесть мы получаем физическую точку(offsetX), в которую мы кликнули на временной шкале прогресса(offsetWidth) и переводим её во время
  video.currentTime = scrubTime;
}

function toggleFullscreen(e) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API/Guide
  if (!document.fullscreenElement) {
    video.requestFullscreen().catch((err) => {
      // prettier-ignore
      console.log(`An error occurred while trying to switch into full-screen mode: ${err.message} (${err.name})`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

toggle.addEventListener("click", togglePlay); // при клике на кнопку play/pause
video.addEventListener("click", togglePlay); // при клике на элемент video(вся область)
document.addEventListener("keydown", spaceHandler); // при нажатии на пробел

// меняем иконку на кнопку play/pause
video.addEventListener("play", updateButton);
video.addEventListener("pause", updateButton);

// перемотать вперёд/назад
skipButtons.forEach((skipButton) => skipButton.addEventListener("click", skip));

// переключать громкость/скорость воспроизведения
ranges.forEach((range) => range.addEventListener("change", handleRangeUpdate));
ranges.forEach((range) => range.addEventListener("mousemove", handleRangeUpdate));

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event, когда меняется currentTime вызываем handleProgress
// тоесть визуализируем progressBar
video.addEventListener("timeupdate", handleProgress);

let isProgressCapturing = false; // нажата ли в данный момент кнопка мыши, нужно для time scrubbing'а не просто по клику в точку на временной шкале, а с зажатой кнопкой мыши и протягиванием шкалы до нужной позиции
progress.addEventListener("click", scrub); // просто кликнули в любое место на шкале
progress.addEventListener("mousedown", () => (isProgressCapturing = true)); // нажали кнопку мыши
progress.addEventListener("mousemove", (e) => isProgressCapturing && scrub(e)); // тянем шкалу в нужное место
progress.addEventListener("mouseup", () => (isProgressCapturing = false)); // отпустили кнопку мыши

fullscreenButton.addEventListener("click", toggleFullscreen);
