# PulseBoard — Campaign Performance Tracker

A small internal tool for a marketing agency to track ad-campaign performance
across clients. Users log in, add campaign data (manually or via CSV upload),
and see a dashboard that computes and ranks performance. Each campaign has an
**AI explainer** that produces a plain-English read on why it's performing the
way it is, grounded in the campaign's actual numbers and platform benchmarks.

**Live demo:** _<add your live URL here>_
**Access password:** _<add the site password here>_ (shared gate in front of the app)

---

## Stack

| Layer    | Choice                                                              |
|----------|--------------------------------------------------------------------|
| Frontend | React 19 + Vite + Tailwind, React Router, Recharts, Axios          |
| Backend  | Django 6 + Django REST Framework, SimpleJWT auth                   |
| Database | PostgreSQL                                                          |
| Cache    | Redis (dashboard results + AI explanations)                        |
| AI       | Anthropic Claude (`claude-sonnet-4-6`)                             |
| Hosting  | Render (API web service, Postgres, Key Value, static site)         |

---

## Features

- **Auth** — email/username + password via JWT. Each user only ever sees their own campaigns (every query is scoped to `request.user`).
- **Data entry** — add campaigns through a form, or bulk-import via CSV with per-row validation (missing columns, empty fields, invalid platforms, and bad numeric values are reported and skipped rather than failing the whole upload).
- **Dashboard** — list of campaigns with computed CTR, CPC, and ROAS; sortable and filterable by platform; a chart visualizing performance.
- **AI explainer** — per-campaign button that calls Claude with the campaign's real metrics plus platform benchmarks, returning a short, specific explanation.
- **Caching** — dashboard results and AI explanations are cached in Redis (see [Key decisions](#key-decisions)).
- **Access gate** — the whole site sits behind a single shared password.

---

## Project layout

```
PulseBoard/
├── api/                 # Django project
│   ├── core/            # settings, urls, wsgi
│   ├── campaigns/       # campaign model, serializers, views (incl. AI explainer)
│   ├── users/           # registration + JWT auth endpoints
│   └── requirements.txt
├── frontend/            # React + Vite app
│   └── src/
├── render.yaml          # Render Blueprint (all four resources)
├── sample_campaigns.csv # example CSV for the bulk import
├── .env.example         # backend env template
└── frontend/.env.example
```

---

## Local development

### Prerequisites
- Python 3.13, Node 20+, PostgreSQL, and Redis running locally.

### Backend

```bash
cd api
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# from the repo root, create your env file:
cp ../.env.example ../.env         # then fill in the values

python manage.py migrate
python manage.py createsuperuser   # optional, for /admin
python manage.py runserver         # http://localhost:8000
```

The backend reads env vars from the repo-root `.env`. Locally it uses the
discrete `DB_*` variables; if a `DATABASE_URL` is present (as on Render) it takes
precedence.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env                # set VITE_API_URL=http://localhost:8000
npm run dev                         # http://localhost:5173
```

Leave `VITE_ACCESS_PASSWORD` empty locally to skip the access gate.

---

## Deployment (Render)

The repo ships a `render.yaml` Blueprint that provisions everything in one go:
a Postgres database, a Key Value (Redis) instance, the Django API, and the
static frontend.

1. **Create the Blueprint.** In Render, *New → Blueprint*, point it at this repo
   and apply. It creates `pulseboard-db`, `pulseboard-redis`, `pulseboard-api`,
   and `pulseboard-web`. `SECRET_KEY`, `DATABASE_URL`, and `REDIS_URL` are wired
   automatically; migrations and `collectstatic` run during the API build.

2. **Set the remaining secrets** (marked `sync: false`) once the service URLs are
   known:

   On **pulseboard-api**:
   | Key | Value |
   |-----|-------|
   | `ANTHROPIC_API_KEY` | your Anthropic key |
   | `CORS_ALLOWED_ORIGINS` | `https://pulseboard-web.onrender.com` |
   | `CSRF_TRUSTED_ORIGINS` | `https://pulseboard-api.onrender.com` |

   On **pulseboard-web**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://pulseboard-api.onrender.com` |
   | `VITE_ACCESS_PASSWORD` | the shared site password |

   (Use your actual Render hostnames if they differ.)

3. **Redeploy** the frontend after setting its env vars (Vite inlines them at
   build time), and the API after setting CORS. Create a user via the app's
   register page or `/admin`.

> **Notes on the free tier:** the Postgres instance expires after ~30 days, and
> the free web service spins down when idle — the first request after a pause
> can take ~30–60s to wake. Both are fine for a demo.

---

## Key decisions

- **JWT over sessions.** A token-based API keeps the React frontend and Django
  backend cleanly decoupled and deployable as independent services. Tokens are
  stored in `localStorage`; rotation + blacklisting are enabled.

- **Per-user data isolation at the query layer.** Rather than object-level
  permissions, every campaign query filters by `user=request.user`, so a user
  physically cannot read or mutate another user's rows.

- **CSV import is forgiving.** Validation happens per row; bad rows are collected
  and returned with row numbers and reasons while the good rows are imported in a
  single `bulk_create`. A marketer uploading a messy export gets partial success
  plus a clear report instead of an all-or-nothing failure.

- **Grounded AI explainer.** The prompt is built from the campaign's real metrics
  *and* platform-specific industry benchmarks, and asks for a fixed structure
  (summary, strongest metric, weakest vs. benchmark, one action). Grounding the
  model in concrete numbers keeps the output specific and accurate rather than
  generic marketing fluff.

- **Caching in Redis.** Dashboard results are cached per user and busted on any
  write (create / edit / delete / CSV import), so repeated page loads don't re-hit
  the DB. AI explanations are cached on a key derived from the campaign's actual
  metrics — identical inputs return instantly with zero token cost, and editing a
  campaign changes the key so a fresh explanation is generated automatically.
  Cache failures degrade gracefully (`IGNORE_EXCEPTIONS`): if Redis is down, the
  app falls through to the database.

- **Access gate vs. platform protection.** Render's free static sites don't offer
  built-in password protection, so the brief's "basic access gate" is implemented
  as a single shared-password screen in front of the app. The per-user login still
  protects each workspace's data behind it.

See [`WRITEUP.md`](./WRITEUP.md) for the short approach/tradeoffs writeup.
