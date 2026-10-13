// src/components/layout.js
// Renders the navigation bar and footer on every page.

function renderNavbar() {
  const el = document.getElementById('navbar');
  if (!el) return;
  const user = getCurrentUser();

  const authLinks = user
    ? `<a href="dashboard.html">Dashboard</a>
       <a href="#" id="logout-btn">Logout (${esc(user.name)})</a>`
    : `<a href="login.html" class="btn btn-sm">Login</a>
       <a href="register.html" class="btn btn-sm btn-outline">Register</a>`;

  el.innerHTML = `
    <nav class="navbar">
      <a class="brand" href="index.html">🎓 Campus Events</a>
      <button class="menu-toggle" aria-label="Toggle menu" id="menu-toggle">☰</button>
      <div class="nav-links" id="nav-links">
        <a href="index.html">Home</a>
        <a href="events.html">Events</a>
        ${authLinks}
      </div>
    </nav>`;

  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      logout();
      location.href = 'index.html';
    });
  }
}

function renderFooter() {
  const el = document.getElementById('footer');
  if (!el) return;
  el.innerHTML = `
    <p>© ${new Date().getFullYear()} Campus Event Management System</p>
    <p><a href="#" id="reset-data">Reset demo data</a></p>`;
  document.getElementById('reset-data').addEventListener('click', e => {
    e.preventDefault();
    if (confirm('Reset all demo data (events, users, registrations)?')) {
      API.resetDemoData();
      location.href = 'index.html';
    }
  });
}

// Shows a status message in an element (type: 'success' | 'error').
function showMessage(el, text, type) {
  if (!el) return;
  el.classList.remove('success', 'error');
  el.classList.add('message', type);
  el.textContent = text;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
});
