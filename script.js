const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

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
