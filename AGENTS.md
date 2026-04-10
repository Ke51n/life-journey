# life-journey

Go + Gin backend with vanilla JS frontend. Personal growth/life tracking app.

## Run

```bash
# SQLite (default, creates life_journal.db)
go run .

# PostgreSQL
DATABASE_URL="postgres://..." go run .

# Custom port
PORT=3000 go run .
```

## Env vars

| Var          | Default                              | Used when          |
|--------------|--------------------------------------|--------------------|
| `PORT`       | `8080`                               | Server bind        |
| `JWT_SECRET` | `your-secret-key-change-in-production` | Token signing  |
| `DATABASE_URL` | (empty)                            | Switch to postgres |

## DB

- Auto-migrates on startup (`models.InitDB`)
- Dialect: `sqlite` (default) or `postgres` if `DATABASE_URL` set
- Tables: `users`, `profiles`, `people`, `relationships`, `records`, `logs`

## API

All routes under `/api` require auth **except**:
- `POST /api/auth/register`
- `POST /api/auth/login`

Auth via JWT in `Authorization: Bearer <token>` header.

## Directories

- `handlers/` - HTTP handlers (auth, people, records, logs)
- `middleware/` - JWT auth
- `models/` - GORM models + DB init
- `config/` - env loading
- `frontend/` - static HTML/CSS/JS served at `/` and `/static`

## Notes

- No test suite present
- No Makefile - use `go run .` or `go build -o life-journal`
- Frontend served from `./frontend` directory
