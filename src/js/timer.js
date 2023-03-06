let hours = 0;
let minutes = 0;
let seconds = 0;

function updateTimer() {
  // Increment the seconds
  seconds++;
  if (seconds == 60) {
    // Increment the minutes and reset the seconds
    seconds = 0;
    minutes++;
    if (minutes == 60) {
      // Increment the hours and reset the minutes
      minutes = 0;
      hours++;
    }
  }

  // Add leading zeros if necessary
  let formattedHours = ("0" + hours).slice(-2);
  let formattedMinutes = ("0" + minutes).slice(-2);
  let formattedSeconds = ("0" + seconds).slice(-2);

  // Display the time in the format hh:mm:ss
  let timer = document.getElementById("timer");
  timer.innerHTML =
    "Simulation Time: " +
    formattedHours +
    ":" +
    formattedMinutes +
    ":" +
    formattedSeconds;
}

// Update the timer every second
setInterval(updateTimer, 1000);
