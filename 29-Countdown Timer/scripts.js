const timerDisplay = document.querySelector(".display__time-left");
const endTime = document.querySelector(".display__end-time");
const buttons = document.querySelectorAll("[data-time]");
let countdown;

function timer(seconds) {
  // удаляем любой запущенный таймер
  clearInterval(countdown);

  const now = Date.now();
  const then = now + seconds * 1000; // now -> значение в мс, поэтому секунды тоже нужно перевести в мс (seconds * 1000)
  displayTimeLeft(seconds); // первый раз вызываем сразу, и потом запускаем в setInterval, это нужно потому что в setInterval первый вызов происходит только через 1с
  displayEndTime(then);

  // каждую секунду отображаем количество оставшегося времени
  countdown = setInterval(() => {
    // сколько времени осталось на часах
    const secondsLeft = Math.round((then - Date.now()) / 1000); // then - Date.now() -> это в мс, нам нужно перевести в секунды, делим на 1000
    // нужно остановить таймер, если время меньше 0
    if (secondsLeft < 0) {
      clearInterval(countdown);
      return;
    }
    // иначе отобразить таймер
    displayTimeLeft(secondsLeft);
  }, 1000);
}

// отображает оставшееся времени
function displayTimeLeft(seconds) {
  // например пришло 100с
  const minutes = Math.floor(seconds / 60); // 1м
  const remainderSeconds = seconds % 60; // остаток секунд, осталось 40с
  const display = `${minutes}:${remainderSeconds < 10 ? "0" : ""}${remainderSeconds}`;
  document.title = display;
  timerDisplay.textContent = display;
}

// показывает когда будет конец времени
function displayEndTime(timestamp) {
  const end = new Date(timestamp);
  const hour = end.getHours();
  const adjustedHour = hour > 12 ? hour - 12 : hour; // можно пропустить этот шаг, это конвертирует часы в американскую систему, тоесть 15:00 -> 3:00
  const minutes = end.getMinutes();
  endTime.textContent = `Be Back At ${adjustedHour}:${minutes < 10 ? "0" : ""}${minutes}`;
}

function startTimer() {
  const seconds = parseInt(this.dataset.time); // 20, 300, 900, 1200, 3600
  timer(seconds);
}

buttons.forEach((button) => button.addEventListener("click", startTimer));
document.customForm.addEventListener("submit", function(e) {
  // console.log(this); // форма
  e.preventDefault();
  const mins = this.minutes.value; // значение из input[name="minutes"]
  console.log(mins);
  timer(mins * 60); // нужно перевести в секунды
  this.reset();
});
