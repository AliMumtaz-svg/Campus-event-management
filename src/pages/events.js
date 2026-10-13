// src/pages/events.js
const eventsState = { search: '', category: '' };

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const categorySelect = document.getElementById('category');

  categorySelect.innerHTML = '<option value="">All categories</option>' +
    CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');

  const initialQuery = new URLSearchParams(location.search).get('q');
  if (initialQuery) {
    searchInput.value = initialQuery;
    eventsState.search = initialQuery;
  }

  searchInput.addEventListener('input', e => {
    eventsState.search = e.target.value;
    refreshEvents();
  });

  categorySelect.addEventListener('change', e => {
    eventsState.category = e.target.value;
    refreshEvents();
  });

  refreshEvents();
});

async function refreshEvents() {
  const grid = document.getElementById('events');
  const countEl = document.getElementById('result-count');
  try {
    const events = await API.getEvents(eventsState);
    countEl.textContent = `${events.length} event(s) found`;
    grid.innerHTML = events.length
      ? events.map(eventCard).join('')
      : '<p class="empty">No events match your search or filter.</p>';
  } catch (err) {
    grid.innerHTML = `<p class="error">${esc(err.message)}</p>`;
  }
}
