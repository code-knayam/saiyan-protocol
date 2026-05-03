# 🔥 SAIYAN PROTOCOL

> *Train like a Saiyan. Track like a Scouter.*

An AI-powered hybrid athlete training app that generates personalized 12-week programs combining CrossFit, running, and calisthenics — with adaptive progression, gamified power levels, and a Dragon Ball Z aesthetic.

---

## What Is This?

Saiyan Protocol is a personal training companion built for athletes who train across multiple disciplines. The AI coach (KAKAROT) generates weekly workout plans, adapts based on your logged performance, and tracks your progress through a gamified "Power Level" system inspired by DBZ.

The app is designed for a specific athlete profile (hybrid athlete, CrossFit + running + calisthenics background) but the architecture supports multi-user operation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8 |
| Backend | Express 4, TypeScript, Bun runtime |
| Database | PostgreSQL 15+ |
| Auth | Firebase Auth (Google Sign-In) |
| AI | Pluggable provider (OpenAI / Anthropic / Gemini ready) |
| Hosting | Firebase Hosting (frontend) |
| PWA | Service Worker, Web App Manifest, maskable icons |
| Styling | Custom CSS with DBZ/Scouter HUD theme |

---

## Features

### ✅ Built and Working

**Authentication & Onboarding**
- Google Sign-In via Firebase Auth
- 3-step onboarding flow (name, body stats, goals & baseline 5km time)
- Multi-user support with per-user profiles

**Dashboard**
- Power Level display with Scouter HUD styling
- Power tier system (Saiyan → Super Saiyan → SSJ2 → SSJ3 → SSJ Blue → Ultra Instinct)
- Today's workout card with quick access
- Upcoming workouts preview
- Weekly intent display
- Mini-stats: streak days, sessions completed, current block/week

**Workout System**
- AI-generated weekly plans across 3 training blocks (12 weeks)
- 6 workout types: CrossFit Upper, CrossFit Lower, Interval Run, Tempo Run, Long Run, Calisthenics
- Structured workout phases: Power Up (warmup) → Strength → Conditioning → Final Strike (finisher) → Ki Recovery (cooldown)
- Per-exercise detail: name, description, coaching cue, sets, reps, rest, substitute movement

**Session Logging**
- Full workout logging with per-exercise, per-set tracking (reps, weight, time)
- Effort rating (1–10 scale)
- Duration tracking
- Notes field
- Power gain calculation based on effort × difficulty multiplier × completion × streak bonus

**Schedule View**
- Full week calendar with workout cards
- Progress bar showing weekly completion
- Day-by-day workout type indicators

**Session History (Log Page)**
- Chronological session history
- Expandable entries with effort, power gained, duration
- Exercise-level breakdown

**Profile**
- Athlete stats display (age, height, weight, 5km time)
- Training progress overview
- Goals display
- Reset progress and logout actions

**Power Level Engine**
- Formula: `(effort × 10) × difficultyMultiplier × completionBonus × streakMultiplier`
- Difficulty multipliers: CrossFit 1.8, Intervals 1.5, Calisthenics 1.3, Tempo 1.2, Long Run 1.0, Benchmark 2.5
- Streak bonus: +10% per consecutive day (capped at +50%)
- Tier progression with named levels

**Adaptive Progression Logic**
- Running: auto-adjusts rounds, rest periods, tempo duration, long run distance based on effort
- CrossFit: scales load and conditioning volume based on completion and effort
- Calisthenics: progresses to next skill variation after 3 consecutive successful sessions
- Overtraining detection: flags if average effort ≤ 4 over last 5 sessions
- Mid-week recalibration for missed sessions

**Backend API**
- `POST /auth/firebase` — authenticate and create/fetch athlete profile
- `GET /athlete` — fetch current profile
- `PATCH /athlete` — update profile fields
- `POST /athlete/reset-progress` — reset power level, sessions, streak
- `GET /workouts/week?week=N&block=N` — fetch weekly schedule
- `POST /workouts/generate` — AI-generate a new week of workouts
- `GET /workouts/:id` — fetch single workout with phases and exercises
- `GET /logs` — session history (paginated)
- `POST /logs` — create session log with exercise/set data
- `GET /logs/:id` — single session detail
- `GET /health` — server health check

**Database Schema (9 tables)**
- `athletes` — user profiles and stats
- `week_schedules` — generated weekly plans
- `workouts` — individual workout records
- `workout_phases` — phases within workouts
- `exercises` — exercises within phases
- `session_logs` — completed session records
- `exercise_logs` — per-exercise completion data
- `set_logs` — per-set tracking (reps, weight, time)
- `ai_generation_logs` — AI call audit trail

**PWA**
- Installable on mobile (manifest + service worker)
- Offline-capable with network-first caching strategy
- Maskable icons for Android/iOS home screen

**Design System**
- Dragon Ball Z / Scouter HUD aesthetic
- Colors: Orange (#E09830), Red (#C41E3A), Blue (#1E90FF), Dark BG (#1a1a1a)
- Pixel fonts for labels, system fonts for body text
- Animated scanlines, crosshairs, sweep effects, staggered fade-ins

---

### 🚧 Planned / In Progress

**AWS Migration** (spec written, not yet implemented)
- Migrate frontend hosting from Firebase to S3 + CloudFront
- Migrate backend from local Express to AWS Lambda + API Gateway (or ECS/Fargate)
- Migrate database from local PostgreSQL to RDS (private VPC)
- Migrate auth from Firebase to AWS Cognito with Google federation
- Infrastructure as Code via AWS CDK (TypeScript)
- CI/CD pipeline via GitHub Actions
- Secrets management via AWS Secrets Manager / SSM Parameter Store
- Monitoring and logging via CloudWatch

**AI Integration** (service stub exists, needs real provider)
- Connect to OpenAI / Anthropic / Gemini for actual workout generation
- Weekly generation, weekly debrief, schedule rotation, mid-week recalibration calls
- Master Roshi coaching voice for debriefs

**Future Features**
- Nutrition tracking and meal suggestions
- Social features (leaderboards, training partners)
- Wearable integration (heart rate, GPS for runs)
- Exercise video/GIF demonstrations
- Push notifications for workout reminders
- Detailed analytics and progress charts
- Export training data (CSV/PDF)

---

## Project Structure

```
saiyan-protocol/
├── api/                    # Express backend
│   └── src/
│       ├── db/             # PostgreSQL schema, migrations, pool
│       ├── middleware/      # Auth middleware (Firebase JWT)
│       ├── routes/         # API route handlers
│       ├── services/       # AI service (pluggable provider)
│       ├── config.ts       # Environment config
│       ├── firebaseAdmin.ts
│       └── index.ts        # Express app entry
├── ui/                     # React frontend
│   ├── public/             # PWA assets, icons, manifest, service worker
│   └── src/
│       ├── api/            # API client (fetch wrapper with auth)
│       ├── assets/         # Images (hero, logos)
│       ├── components/     # Reusable UI (Layout, PowerLevel, WorkoutCard, GokuBackground)
│       ├── data/           # Static data (athlete defaults, workout templates)
│       ├── pages/          # Route pages (Dashboard, Schedule, Log, Profile, Login, Onboarding, WorkoutDetail)
│       ├── App.tsx         # Router setup
│       ├── firebase.ts     # Firebase client config
│       ├── powerEngine.ts  # Power level calculation engine
│       ├── store.tsx       # React Context state management
│       └── types.ts        # TypeScript type definitions
├── package.json            # Bun workspace root
└── firebase.json           # Firebase Hosting config
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (package manager and API runtime)
- [Node.js](https://nodejs.org/) 18+ (for Vite/React tooling)
- PostgreSQL 15+
- Firebase project (for auth)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd saiyan-protocol
bun install

# Set up environment variables
cp api/.env.example api/.env
cp ui/.env.example ui/.env
# Edit both .env files with your credentials

# Run database migrations
bun run --cwd api db:migrate

# Start development (both UI and API)
bun run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start both UI dev server and API |
| `bun run build` | Build both UI and API |
| `bun run deploy` | Deploy UI to Firebase Hosting |
| `bun run --cwd api db:migrate` | Run database migrations |
| `bun run --cwd api start` | Start API in production mode |

---

## 12-Week Program Overview

| Block | Weeks | Name | Focus |
|-------|-------|------|-------|
| 1 | 1–4 | Saiyan Arc | Base building. Movement patterns, aerobic base, technique. Moderate intensity. |
| 2 | 5–8 | Namek Arc | Intensity build. Heavier loads, faster intervals, harder progressions. |
| 3 | 9–12 | Cell Games Arc | Peak phase. Maximum intensity, benchmark testing, retest 5km. |

### Weekly Schedule

| Day | Session | Type |
|-----|---------|------|
| Monday | Combat Training | CrossFit WOD — Upper Focus |
| Tuesday | Gravity Training | Run — Intervals |
| Wednesday | Gravity Training | Run — Tempo |
| Thursday | Combat Training | CrossFit WOD — Lower Focus |
| Friday | Turtle School Method | Calisthenics Skill Day |
| Saturday | Gravity Training | Run — Long Run |
| Sunday | Hyperbolic Rest | Full Rest |

---

## License

Private project. Not open source.
