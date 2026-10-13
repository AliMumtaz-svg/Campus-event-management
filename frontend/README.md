# Frontend

Plain HTML5, CSS3 and JavaScript (no build step needed).

## Structure
- `*.html` – pages: home, events, event details, login, register, dashboard
- `src/css/style.css` – all styling (responsive)
- `src/js/data.js` – data service (`API` object with async methods, validation, session)
- `src/components/` – reusable pieces: navbar/footer (`layout.js`) and event card (`eventCard.js`)
- `src/pages/` – one script per page

## Run
Open `index.html` in a browser, or from this folder run:
```bash
python -m http.server 8000
```
then visit http://localhost:8000
