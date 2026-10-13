// src/pages/event.js
document.addEventListener('DOMContentLoaded', loadEventDetail);

async function loadEventDetail() {
  const box = document.getElementById('event-detail');
  const id = new URLSearchParams(location.search).get('id');

  try {
    const ev = await API.getEvent(id);
    const user = getCurrentUser();

    let registered = false;
    if (user && user.role === 'student') {
      const mine = await API.getMyRegistrations();
      registered = mine.some(r => r.eventId === ev.id);
    }

    let action;
    if (!user) {
      const next = encodeURIComponent('event.html?id=' + ev.id);
      action = `<a class="btn" href="login.html?next=${next}">Login to Register</a>`;
    } else if (user.role === 'admin') {
      action = '<p class="note">Administrators manage events from the dashboard.</p>';
    } else if (registered) {
      action = '<p class="success">✅ You are registered for this event.</p>';
    } else if (ev.seatsLeft === 0) {
      action = '<button class="btn" disabled>Sold Out</button>';
    } else {
      action = '<button id="register-btn" class="btn">Register for this Event</button>';
    }

    box.innerHTML = `
      <div class="detail">
        <span class="badge">${esc(ev.category)}</span>
        <h1>${esc(ev.title)}</h1>
        <ul class="meta big">
          <li>📅 <strong>Date:</strong> ${formatDate(ev.date)}</li>
          <li>⏰ <strong>Time:</strong> ${formatTime(ev.time)}</li>
          <li>📍 <strong>Location:</strong> ${esc(ev.location)}</li>
          <li>🏷️ <strong>Category:</strong> ${esc(ev.category)}</li>
          <li>🪑 <strong>Available seats:</strong> ${ev.seatsLeft} / ${ev.capacity}</li>
        </ul>
        <h3>Description</h3>
        <p>${esc(ev.description)}</p>
        <div class="action-area">${action}</div>
        <p id="message" class="message"></p>
      </div>`;

    const btn = document.getElementById('register-btn');
    if (btn) btn.addEventListener('click', () => handleRegister(ev.id));
  } catch (err) {
    box.innerHTML = `<p class="error">${esc(err.message)}</p>`;
  }
}

async function handleRegister(eventId) {
  const msg = document.getElementById('message');
  try {
    await API.register(eventId);
    showMessage(msg, 'Registration successful! 🎉', 'success');
    setTimeout(loadEventDetail, 1000);
  } catch (err) {
    showMessage(msg, err.message, 'error');
  }
}
