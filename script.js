const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Countdown timer - Launch on December 17, 2026 at 12:00 AM PKT (UTC+5)
const launchDate = new Date("2026-12-17T00:00:00+05:00");
const countdownElement = document.getElementById("countdown");
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const launchMessageElement = document.getElementById("launch-message");

function updateCountdown() {
  const now = new Date().getTime();
  const distance = launchDate.getTime() - now;

  if (distance <= 0) {
    // Countdown has ended
    if (countdownElement) {
      countdownElement.style.display = "none";
    }
    if (launchMessageElement) {
      launchMessageElement.style.display = "block";
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (daysElement) daysElement.textContent = String(days).padStart(2, "0");
  if (hoursElement) hoursElement.textContent = String(hours).padStart(2, "0");
  if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, "0");
  if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, "0");
}

// Update countdown immediately and every second
updateCountdown();
setInterval(updateCountdown, 1000);

const form = document.getElementById("access-form");
const message = document.getElementById("form-message");

if (form && message) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = document.getElementById("email");
    const email = emailInput.value.trim();

    if (!emailInput.checkValidity() || !email) {
      emailInput.reportValidity();
      return;
    }

    // Front-end demo only: no email is stored or sent anywhere.
    message.textContent = "Thank you for your interest. Early access sign-up is not connected yet.";
    message.classList.add("message-visible");
    form.reset();
  });
}
