# Dresser

A mobile-first closet inventory app with a Habitica-inspired pixel-art aesthetic. Track your clothing, resist fast fashion, and get rewarded for sustainable habits.

See app at https://dresser-app.vercel.app/login

## Stack

- **Backend:** Python 3.14, FastAPI, SQLAlchemy (async), Alembic, PostgreSQL (Supabase)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4
- **Auth:** JWT (python-jose), bcrypt
- **Image storage:** Local filesystem (`uploads/`)
- **Package managers:** `uv` (Python), `npm` (frontend)

## Project structure

```
dresser/
├── backend/
│   ├── models/          # SQLAlchemy ORM models (User, ClothingItem)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── routers/         # FastAPI route handlers (auth, items)
│   ├── services/        # Business logic (auth, CRUD, image handling)
│   ├── app.py           # FastAPI app factory
│   ├── config.py        # Settings via pydantic-settings (.env)
│   ├── database.py      # Async SQLAlchemy engine + session
│   └── dependencies.py  # get_db, get_current_user
├── frontend/            # React + Vite app
│   └── src/
│       ├── api/         # axios client with auth interceptors
│       ├── auth/        # AuthContext, JWT token management
│       ├── components/  # UI + layout + closet components
│       ├── hooks/       # useItems, useItem
│       ├── pages/       # Route-level page components
│       └── types/       # Shared TypeScript types
├── alembic/             # Database migrations
├── uploads/             # Local image storage (gitignored)
├── main.py              # Uvicorn entry point
└── .env                 # Local environment variables (gitignored)
```

## Local development

### Prerequisites

- Python 3.14+
- [uv](https://docs.astral.sh/uv/)
- Node.js 18+

### Setup

```bash
# Clone and enter the project
git clone <repo-url>
cd dresser

# Copy env file and fill in your values
cp .env.example .env

# Install Python dependencies
uv sync

# Run database migrations
uv run alembic upgrade head

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Running

```bash
# Terminal 1 — backend (http://localhost:8000)
uv run python main.py

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

The Vite dev server proxies `/api/*` to the backend, so no CORS setup is needed locally.

API docs (Swagger UI): http://localhost:8000/docs

### Environment variables

| Variable                      | Description                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `SECRET_KEY`                  | Random hex string for JWT signing — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM`                   | JWT algorithm, default `HS256`                                                                               |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime, default `10080` (7 days)                                                                     |
| `DATABASE_URL`                | Async PostgreSQL URL, e.g. `postgresql+asyncpg://user:pass@host:6543/db?ssl=require`                         |
| `UPLOAD_DIR`                  | Path to image upload directory, default `./uploads`                                                          |
| `MAX_IMAGE_SIZE_MB`           | Max upload size, default `5`                                                                                 |

### Database migrations

```bash
# Apply all pending migrations
uv run alembic upgrade head

# Create a new migration after changing models
uv run alembic revision --autogenerate -m "description"

# Roll back one migration
uv run alembic downgrade -1
```

## Deployment (Railway + Vercel)

### Before deploying

Two changes are needed for production:

1. **Add CORS** to `backend/app.py` — allow requests from your Vercel frontend domain
2. **Set `VITE_API_BASE_URL`** in the frontend so it hits the Railway backend URL instead of the Vite proxy

### Backend → Railway

1. Push the repo to GitHub
2. Create a new Railway project → **Deploy from GitHub repo**
3. Set environment variables in Railway (same as `.env`, with your production `DATABASE_URL`)
4. Add a **Volume** mounted at `./uploads` for persistent image storage
5. Railway auto-detects `main.py` and runs it with uvicorn

### Frontend → Vercel

1. Import the repo in Vercel, set **Root Directory** to `frontend`
2. Add environment variable: `VITE_API_BASE_URL=https://your-railway-app.railway.app`
3. Vercel auto-runs `npm run build` on every push to main

## Features (Phase 1)

- User auth: register, login, password reset
- Clothing item CRUD with image upload
- Item metadata: category, subcategory, source, fabric, date acquired, season, notes
- Age computed automatically from date acquired
- Closet grid view with category filter
- Mobile-first layout with bottom navigation
- Pixel-art aesthetic (Press Start 2P font, pink palette, sharp borders)

## Roadmap

- **Phase 2:** Outfit creation, outfit logging, wear statistics
- **Phase 3:** Gamification dashboard, XP system, achievements
