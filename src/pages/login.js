// src/pages/login.js
function isSafeNext(url) {
  return !/^(https?:|\/\/|javascript:)/i.test(url) && !url.includes('://');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const msg = document.getElementById('message');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showMessage(msg, 'Please fill in all fields.', 'error');
      return;
    }

    try {
      const user = await API.login(email, password);
      showMessage(msg, `Welcome back, ${user.name}!`, 'success');
      const next = new URLSearchParams(location.search).get('next');
      setTimeout(() => {
        location.href = next && isSafeNext(next) ? next : 'dashboard.html';
      }, 600);
    } catch (err) {
      showMessage(msg, err.message, 'error');
    }
  });
});
