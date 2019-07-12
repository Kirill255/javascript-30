const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

function getVideo() {
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  // запрашиваем разрешение только на video
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((localMediaStream) => {
      // console.log(localMediaStream);

      // пример работы с видео src
      // video.src = some_video.mp4; // любое видео
      // а stream, мы должны сначала конвертировать https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject#Usage_notes
      // video.src = window.URL.createObjectURL(localMediaStream); // stream

      // Deprecated:
      // The following has been deprecated by major browsers as of Chrome and Firefox
      // video.src = window.URL.createObjectURL(localMediaStream);
      // video.play();
      // Please refer to these:
      // Deprecated - https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
      // Newer Syntax - https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject

      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
      // поддержка srcObject только в новых браузерах, для старых есть пример по ссылке
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(console.log);
}

function paintToCanvas(e) {
  const width = video.videoWidth; // размеры с камеры
  const height = video.videoHeight;
  // console.log(width, height);
  canvas.width = width; // мы должны задать точно такие же размеры для canvas'а, это важно!
  canvas.height = height;

  // отрисовываем видео на canvas каждые 16мс, это связано с производительностью компьютера, на слабых можно увеличить число, то есть не так часто отрисовывать, также можно поиграться с https://developer.mozilla.org/ru/docs/DOM/window.requestAnimationFrame
  // setInterval(() => {
  //   ctx.drawImage(video, 0, 0, width, height); // рисуем видео на canvas'е https://developer.mozilla.org/ru/docs/Web/API/CanvasRenderingContext2D/drawImage
  // }, 16);

  // return нужен чтобы мы могли потом отменить интервал, как известно setInterval возвращает какой-то id, пример: const id = paintToCanvas(); clearInterval(id);
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);

    // берём пиксельные данные из области холста https://developer.mozilla.org/ru/docs/Web/API/CanvasRenderingContext2D/getImageData
    let pixels = ctx.getImageData(0, 0, width, height);

    // делаем с ними что-то, применяем эффекты(фильтры), можно сказать трансформируем
    // примените любой из фильтров
    // pixels = redEffect(pixels); // фильтр 1

    // pixels = rgbSplit(pixels); // фильтр 2
    // ctx.globalAlpha = 0.8; // фильтр 3

    pixels = greenScreen(pixels); // фильтр 4

    // и кладём обратно https://developer.mozilla.org/ru/docs/Web/API/CanvasRenderingContext2D/putImageData
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  // проигрываем audio, эффект снимка фотоаппарата
  snap.currentTime = 0;
  snap.play();

  // берём данные из canvas'а в формате "image/jpeg" https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
  const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  link.href = data;
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
  link.setAttribute("download", "handsome");
  link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
  // https://developer.mozilla.org/ru/docs/Web/API/ImageData
  // https://developer.mozilla.org/ru/docs/Web/API/ImageData/data
  // console.log(pixels);
  // debugger;
  // pixels - это ImageData, c свойством data - это огромный массив(кстати тоже не совсем массив, типа NodeList, -> Uint8ClampedArray, он тоже не имеет некоторых методом массива, типа map) с пикселями(с миллионами пикселей), любой цвет задаётся комбинацией трёх основных цветов red, green, blue, а также alpha(прозрачность)
  // дак вот в этом массиве каждые! 4 элемента - это цвет rgba, то есть
  // [0 - r, 1 - g, 2 - b, 3 - a,
  //  4 - r, 5 - g, 6 - b, 7 - a, ... и т.д.]

  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  // сдесь необязательно преобразовывать NodeList в массив [...document.querySelectorAll(".rgb input")], т.к. метод forEach у NodeList есть
  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // если пиксель подходит под условие, то делаем его полностью прозрачным(4 элемент это alpha)
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

// при запуске программы сразу запрашиваем разрешение и потом подписываемся на canplay
getVideo();

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplay_event
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event
video.addEventListener("canplay", paintToCanvas); // мы слушаем canplay т.к. у нас stream, а не видео, которое может быть полностью загружено в буффер
