// src/pages/register.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const msg = document.getElementById('message');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirm = form.confirm.value;

    if (!name || !email || !password || !confirm) {
      showMessage(msg, 'Please fill in all fields.', 'error');
      return;
    }
    if (password !== confirm) {
      showMessage(msg, 'Passwords do not match.', 'error');
      return;
    }

    try {
      const user = await API.signup({ name, email, password });
      showMessage(msg, `Account created. Welcome, ${user.name}!`, 'success');
      setTimeout(() => { location.href = 'dashboard.html'; }, 800);
    } catch (err) {
      showMessage(msg, err.message, 'error');
    }
  });
});
