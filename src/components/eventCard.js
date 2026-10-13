// src/components/eventCard.js
// Shared helpers: HTML escaping, date/time formatting and the event card component.

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function eventCard(ev) {
  const short = ev.description.length > 110 ? ev.description.slice(0, 110) + '…' : ev.description;
  return `
    <article class="card">
      <span class="badge">${esc(ev.category)}</span>
      <h3>${esc(ev.title)}</h3>
      <p>${esc(short)}</p>
      <ul class="meta">
        <li>📅 ${formatDate(ev.date)} · ${formatTime(ev.time)}</li>
        <li>📍 ${esc(ev.location)}</li>
        <li>🪑 ${ev.seatsLeft} seats left</li>
      </ul>
      <a class="btn btn-sm" href="event.html?id=${ev.id}">View Details</a>
    </article>`;
}
