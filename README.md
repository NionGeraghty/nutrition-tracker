# Macro Tracker

A full-stack nutrition tracking app that lets you log foods, track daily macros against personal goals, and view your eating history — built from scratch to learn the full modern web stack end to end.

**Live app:** https://nutrition-tracker-theta-self.vercel.app
**API:** https://nutrition-tracker-production-e451.up.railway.app

## Features

- Build a personal food database with per-100g nutritional values
- Log meals throughout the day, grouped by breakfast/lunch/dinner/snack
- Automatic daily macro totals compared against personal goals, with remaining allowance calculated in real time
- Calorie/macro goal calculator based on the Mifflin-St Jeor equation (height, weight, age, sex, activity level, and goal type)
- Browse and edit past days' entries
- Full authentication: signup, login, logout, and password reset via email
- Responsive design, usable on both desktop and mobile

## Tech stack

**Backend**
- Node.js, Express, TypeScript
- PostgreSQL, with schema managed via versioned migrations (`node-pg-migrate`)
- Session-based authentication (`express-session` + `connect-pg-simple`), with `bcrypt` password hashing
- Vitest + Supertest, with an isolated test database — 35 integration tests covering CRUD, validation, authentication, and multi-user data isolation
- Resend for transactional email (password reset)

**Frontend**
- Next.js (App Router), React, TypeScript
- Tailwind CSS
- Server Components for data fetching, Client Components for interactivity

**Deployment**
- Backend + PostgreSQL hosted on Railway
- Frontend hosted on Vercel
- Cross-domain session cookies handled via a Next.js rewrite proxy

## Architecture notes

- Backend follows a routes → controllers → database pattern, with every table's schema captured in a committed migration rather than applied by hand
- All data is scoped per-user at the query level, verified by dedicated isolation tests
- Frontend and backend are fully decoupled, communicating over a REST API

## Running locally

**Backend**
```bash
cd server
npm install
npm run migrate up
npm run dev
```

**Frontend**
```bash
cd client
npm install
npm run dev
```

Requires a local PostgreSQL instance and a `.env` file in `server/` (see `.env.example` if present, or the environment variables referenced in `src/db.ts` and `src/app.ts`).

## Testing

```bash
cd server
npm test
```

## What I learned building this

This was my first project working with PostgreSQL, TypeScript on the backend, and session-based authentication end to end. Along the way I worked through real production concerns beyond just making features work: SQL injection prevention via parameterized queries, database migrations as a discipline (not just running SQL by hand), cross-origin cookie behavior in production, and the difference between how Server and Client Components in Next.js handle authentication.
