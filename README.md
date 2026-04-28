# School Stock Management System (Simple Fullstack)

A beginner-friendly school stock management system.

## Tech Stack
- **Frontend:** React (create-react-app style) + Tailwind CDN (no npm tailwind package)
- **Backend:** FastAPI + SQLite + SQLAlchemy

## Project Structure

```text
backend/
  main.py
  database.py
  models.py
  schemas.py
  auth.py
  crud.py
  requirements.txt
  uploads/
    profile/
    items/
    settings/

frontend/
  public/
    index.html
    manifest.json
  src/
    App.js
    index.js
    api.js
    components/
    context/
    pages/
    utils/
```

## Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on `http://127.0.0.1:8000`

## Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## Default Admin Account
- Username: `admin`
- Password: `admin123`

This user is auto-seeded at backend startup.

## How frontend connects to backend
`frontend/src/api.js` contains:
- base URL `http://127.0.0.1:8000`
- token handling from localStorage
- reusable `api()` helper for JSON/FormData requests

## Core Features Implemented
- Login, logout, protected routes, JWT token auth
- Dashboard summary + recent data + low stock section
- Profile view/edit + upload preview + password change
- CRUD users/categories/suppliers/items/stock in/stock out
- Stock in auto-adds quantity
- Stock out auto-reduces quantity and prevents insufficient stock
- Reports page with filters, print, CSV export
- Settings update school name/logo/contact info + live logo preview
- Dark/light mode toggle persisted in localStorage
- Responsive sidebar + navbar layout

## API Endpoint List

### Auth & Profile
- `POST /auth/login`
- `GET /auth/me`
- `PUT /profile`
- `POST /profile/upload`
- `POST /profile/change-password`

### Users
- `GET /users`
- `POST /users`
- `GET /users/{id}`
- `PUT /users/{id}`
- `DELETE /users/{id}`

### Categories
- `GET /categories`
- `POST /categories`
- `GET /categories/{id}`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`

### Suppliers
- `GET /suppliers`
- `POST /suppliers`
- `GET /suppliers/{id}`
- `PUT /suppliers/{id}`
- `DELETE /suppliers/{id}`

### Items
- `GET /items`
- `POST /items`
- `GET /items/{id}`
- `PUT /items/{id}`
- `DELETE /items/{id}`
- `POST /items/{id}/upload`

### Stock In
- `GET /stock-in`
- `POST /stock-in`
- `PUT /stock-in/{id}`
- `DELETE /stock-in/{id}`

### Stock Out
- `GET /stock-out`
- `POST /stock-out`
- `PUT /stock-out/{id}`
- `DELETE /stock-out/{id}`

### Reports
- `GET /reports`
- `GET /reports/export-csv`

### Settings
- `GET /settings`
- `PUT /settings`
- `POST /settings/upload-logo`

### Upload static
- `GET /uploads/{folder}/{filename}`

## Notes
- Keep it simple: no Redux, no Docker, no complex role permission.
- Uses local component state + hooks.
- Friendly for student projects and easy to extend.
