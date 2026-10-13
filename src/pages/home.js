// src/pages/home.js
document.addEventListener('DOMContentLoaded', async () => {
  const featured = document.getElementById('featured');

  document.getElementById('hero-search').addEventListener('submit', e => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    location.href = 'events.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  });

  try {
    const events = (await API.getEvents()).slice(0, 3);
    featured.innerHTML = events.length
      ? events.map(eventCard).join('')
      : '<p class="empty">No featured events right now.</p>';
  } catch (err) {
    featured.innerHTML = `<p class="error">${esc(err.message)}</p>`;
  }
});
