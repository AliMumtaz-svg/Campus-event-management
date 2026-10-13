// src/js/data.js
// Data service layer. Data is stored in the browser's localStorage and exposed
// through async methods (API object), so pages never touch storage directly.
// To connect a real backend later, replace the method bodies with fetch() calls.

const STORAGE_KEY = 'cems_data_v1';
const SESSION_KEY = 'cems_session_v1';
const CATEGORIES = ['Seminar', 'Workshop', 'Sports', 'Competition', 'Conference', 'Society'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SEED_DATA = {
  nextIds: { user: 3, event: 7, registration: 1 },
  users: [
    { id: 1, name: 'Administrator', email: 'admin@uni.edu', password: 'admin123', role: 'admin' },
    { id: 2, name: 'Demo Student', email: 'student@uni.edu', password: 'student123', role: 'student' }
  ],
  events: [
    { id: 1, title: 'AI Workshop', description: 'A hands-on workshop on building practical AI tools with Python. Bring your laptop.', date: '2026-11-05', time: '10:00', location: 'Lab 3, CS Block', category: 'Workshop', capacity: 30 },
    { id: 2, title: 'Future of Renewable Energy', description: 'A seminar by industry experts on solar, wind and battery technologies.', date: '2026-11-10', time: '14:00', location: 'Main Auditorium', category: 'Seminar', capacity: 120 },
    { id: 3, title: 'Inter-University Football Cup', description: 'Football matches between the top university teams. Come and cheer for your team.', date: '2026-11-15', time: '16:00', location: 'University Stadium', category: 'Sports', capacity: 200 },
    { id: 4, title: 'Campus Hackathon 2026', description: 'A 12-hour coding competition. Form a team of up to four and build something useful.', date: '2026-11-20', time: '09:00', location: 'Innovation Hall', category: 'Competition', capacity: 80 },
    { id: 5, title: 'Student Societies Fair', description: 'Meet every student society, join clubs and see their activities for the semester.', date: '2026-11-25', time: '11:00', location: 'Student Center Lawn', category: 'Society', capacity: 300 },
    { id: 6, title: 'National Tech Conference', description: 'Keynotes and panels on software engineering, cloud computing and careers in tech.', date: '2026-12-02', time: '09:30', location: 'Convention Hall', category: 'Conference', capacity: 500 }
  ],
  registrations: []
};

// ---------- low-level storage helpers ----------
const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) { console.error('Storage error', e); } },
  del(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }
};

function loadDB() {
  const raw = store.get(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* corrupted data: reseed below */ }
  }
  const fresh = JSON.parse(JSON.stringify(SEED_DATA));
  saveDB(fresh);
  return fresh;
}

function saveDB(db) { store.set(STORAGE_KEY, JSON.stringify(db)); }

function countRegistrations(db, eventId) {
  return db.registrations.filter(r => r.eventId === eventId).length;
}

function withSeats(db, ev) {
  return { ...ev, seatsLeft: Math.max(0, ev.capacity - countRegistrations(db, ev.id)) };
}

// ---------- session ----------
function getCurrentUser() {
  const id = Number(store.get(SESSION_KEY));
  if (!id) return null;
  const user = loadDB().users.find(u => u.id === id);
  return user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
}

function setSession(userId) { store.set(SESSION_KEY, String(userId)); }
function logout() { store.del(SESSION_KEY); }

function currentUserOrThrow() {
  const user = getCurrentUser();
  if (!user) throw new Error('Please log in first.');
  return user;
}

function adminOrThrow() {
  const user = currentUserOrThrow();
  if (user.role !== 'admin') throw new Error('Only administrators can do this.');
  return user;
}

// ---------- validation ----------
function validateEvent(data) {
  const title = (data.title || '').trim();
  const description = (data.description || '').trim();
  const date = (data.date || '').trim();
  const time = (data.time || '').trim();
  const location = (data.location || '').trim();
  const category = (data.category || '').trim();
  const capacity = Number(data.capacity);

  const errors = [];
  if (title.length < 3) errors.push('Title must be at least 3 characters.');
  if (description.length < 10) errors.push('Description must be at least 10 characters.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('Please choose a valid date.');
  if (!/^\d{2}:\d{2}$/.test(time)) errors.push('Please choose a valid time.');
  if (location.length < 2) errors.push('Location is required.');
  if (!CATEGORIES.includes(category)) errors.push('Please choose a valid category.');
  if (!Number.isInteger(capacity) || capacity < 1) errors.push('Capacity must be a whole number of at least 1.');

  if (errors.length) throw new Error(errors.join(' '));
  return { title, description, date, time, location, category, capacity };
}

// ---------- API (async, like REST calls) ----------
const API = {
  async getEvents({ search = '', category = '' } = {}) {
    const db = loadDB();
    const q = search.trim().toLowerCase();
    return db.events
      .filter(e => !category || e.category === category)
      .filter(e => !q || [e.title, e.description, e.location, e.category]
        .some(field => field.toLowerCase().includes(q)))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .map(e => withSeats(db, e));
  },

  async getEvent(id) {
    const db = loadDB();
    const ev = db.events.find(e => e.id === Number(id));
    if (!ev) throw new Error('Event not found.');
    return withSeats(db, ev);
  },

  async createEvent(data) {
    adminOrThrow();
    const db = loadDB();
    const ev = { id: db.nextIds.event++, ...validateEvent(data) };
    db.events.push(ev);
    saveDB(db);
    return ev;
  },

  async updateEvent(id, data) {
    adminOrThrow();
    const db = loadDB();
    const idx = db.events.findIndex(e => e.id === Number(id));
    if (idx < 0) throw new Error('Event not found.');
    const updated = { ...db.events[idx], ...validateEvent({ ...db.events[idx], ...data }) };
    const booked = countRegistrations(db, updated.id);
    if (updated.capacity < booked) {
      throw new Error(`Capacity cannot be less than the current registrations (${booked}).`);
    }
    db.events[idx] = updated;
    saveDB(db);
    return updated;
  },

  async deleteEvent(id) {
    adminOrThrow();
    const db = loadDB();
    const eventId = Number(id);
    const before = db.events.length;
    db.events = db.events.filter(e => e.id !== eventId);
    if (db.events.length === before) throw new Error('Event not found.');
    db.registrations = db.registrations.filter(r => r.eventId !== eventId);
    saveDB(db);
    return true;
  },

  async register(eventId) {
    const user = currentUserOrThrow();
    const db = loadDB();
    const ev = db.events.find(e => e.id === Number(eventId));
    if (!ev) throw new Error('Event not found.');
    if (db.registrations.some(r => r.eventId === ev.id && r.userId === user.id)) {
      throw new Error('You are already registered for this event.');
    }
    if (countRegistrations(db, ev.id) >= ev.capacity) throw new Error('Sorry, this event is sold out.');
    const reg = {
      id: db.nextIds.registration++,
      userId: user.id,
      eventId: ev.id,
      registrationDate: new Date().toISOString().slice(0, 10)
    };
    db.registrations.push(reg);
    saveDB(db);
    return reg;
  },

  async getMyRegistrations() {
    const user = currentUserOrThrow();
    const db = loadDB();
    return db.registrations
      .filter(r => r.userId === user.id)
      .map(r => {
        const ev = db.events.find(e => e.id === r.eventId);
        return ev ? { ...r, event: withSeats(db, ev) } : null;
      })
      .filter(Boolean);
  },

  async login(email, password) {
    const db = loadDB();
    const e = String(email || '').trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === e && u.password === password);
    if (!user) throw new Error('Invalid email or password.');
    setSession(user.id);
    return { id: user.id, name: user.name, role: user.role };
  },

  async signup({ name, email, password }) {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanName.length < 2) throw new Error('Name must be at least 2 characters.');
    if (!EMAIL_RE.test(cleanEmail)) throw new Error('Please enter a valid email address.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

    const db = loadDB();
    if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const user = { id: db.nextIds.user++, name: cleanName, email: cleanEmail, password, role: 'student' };
    db.users.push(user);
    saveDB(db);
    setSession(user.id);
    return { id: user.id, name: user.name, role: user.role };
  },

  resetDemoData() {
    store.del(STORAGE_KEY);
    store.del(SESSION_KEY);
    loadDB();
  }
};
