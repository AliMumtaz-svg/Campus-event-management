// src/pages/dashboard.js
// Students see their registrations. Administrators get full event management (CRUD).
let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) {
    location.href = 'login.html?next=dashboard.html';
    return;
  }
  document.getElementById('welcome').textContent = `Welcome, ${user.name}`;

  try {
    if (user.role === 'admin') await initAdmin();
    else await initStudent();
  } catch (err) {
    document.querySelector('main').insertAdjacentHTML('afterbegin', `<p class="error">${esc(err.message)}</p>`);
  }
});

async function initStudent() {
  document.getElementById('student-section').hidden = false;
  const regs = await API.getMyRegistrations();
  document.getElementById('my-registrations').innerHTML = regs.length
    ? regs.map(r => `
        <tr>
          <td>${esc(r.event.title)}</td>
          <td>${formatDate(r.event.date)} · ${formatTime(r.event.time)}</td>
          <td>${esc(r.event.location)}</td>
          <td>${esc(r.registrationDate)}</td>
        </tr>`).join('')
    : `<tr><td colspan="4" class="empty">You have not registered for any events yet.
         <a href="events.html">Browse events</a></td></tr>`;
}

async function initAdmin() {
  document.getElementById('admin-section').hidden = false;
  const form = document.getElementById('event-form');

  form.category.innerHTML = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  form.addEventListener('submit', saveEventForm);
  document.getElementById('cancel-edit').addEventListener('click', resetEventForm);

  await refreshAdminTable();
}

async function refreshAdminTable() {
  const tbody = document.getElementById('admin-events');
  const events = await API.getEvents();

  tbody.innerHTML = events.length
    ? events.map(ev => `
        <tr>
          <td>${esc(ev.title)}</td>
          <td>${esc(ev.category)}</td>
          <td>${formatDate(ev.date)}</td>
          <td>${ev.capacity - ev.seatsLeft} / ${ev.capacity}</td>
          <td class="actions">
            <button class="btn btn-sm" data-edit="${ev.id}">Edit</button>
            <button class="btn btn-sm btn-danger" data-delete="${ev.id}">Delete</button>
          </td>
        </tr>`).join('')
    : '<tr><td colspan="5" class="empty">No events yet.</td></tr>';

  tbody.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => startEdit(Number(btn.dataset.edit))));
  tbody.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', () => removeEvent(Number(btn.dataset.delete))));
}

async function startEdit(id) {
  const form = document.getElementById('event-form');
  const msg = document.getElementById('event-message');
  try {
    const ev = await API.getEvent(id);
    Object.entries(ev).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
    editingId = id;
    document.getElementById('submit-event').textContent = 'Update Event';
    document.getElementById('cancel-edit').hidden = false;
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showMessage(msg, err.message, 'error');
  }
}

function resetEventForm() {
  const form = document.getElementById('event-form');
  form.reset();
  editingId = null;
  document.getElementById('submit-event').textContent = 'Create Event';
  document.getElementById('cancel-edit').hidden = true;
}

async function saveEventForm(e) {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('event-message');
  const data = Object.fromEntries(new FormData(form));

  try {
    if (editingId) {
      await API.updateEvent(editingId, data);
      resetEventForm();
      showMessage(msg, 'Event updated successfully.', 'success');
    } else {
      await API.createEvent(data);
      resetEventForm();
      showMessage(msg, 'Event created successfully.', 'success');
    }
    await refreshAdminTable();
  } catch (err) {
    showMessage(msg, err.message, 'error');
  }
}

async function removeEvent(id) {
  const msg = document.getElementById('event-message');
  if (!confirm('Delete this event and all of its registrations?')) return;
  try {
    await API.deleteEvent(id);
    if (editingId === id) resetEventForm();
    showMessage(msg, 'Event deleted.', 'success');
    await refreshAdminTable();
  } catch (err) {
    showMessage(msg, err.message, 'error');
  }
}
