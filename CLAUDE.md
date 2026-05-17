# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

No test framework is configured.

## Tech Stack

- **React 19 + Vite 7** — SPA with Hot Module Replacement
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- **Supabase** (`@supabase/supabase-js`) — PostgreSQL backend-as-a-service

Language is plain JavaScript (JSX), not TypeScript.

## Architecture

The app is intentionally minimal — a single-component CRUD todo list.

**`src/supabase-client.js`** — exports a Supabase client singleton configured from `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`.

**`src/App.jsx`** — the entire application: state, all four CRUD operations, and UI. No component decomposition.

**Supabase table:** `Tasks` with columns `id` (PK), `toDoName` (text), `isCompleted` (boolean). Row Level Security is disabled (intentional for learning).

**Data flow pattern:** async/await with `{ data, error }` destructuring, errors logged to console only, state updated immediately after each Supabase call.

## Environment Variables

Requires a `.env` file at the project root:

```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_KEY=<your-supabase-publishable-key>
```

Vite exposes these as `import.meta.env.VITE_*`. The `.env` file must not be committed.

# UI / UX Guidelines

## Design Philosophy
- Premium editorial aesthetic
- Minimalistisch, klinisch und luxuriös
- Viel whitespace und starke visuelle Hierarchie
- Cinematic storytelling sections
- Mobile-first
- Ruhige, elegante Animationen
- Wissenschaftlich und high-trust wirken
- Keine aggressiven Farben oder überladenen Interfaces

## Colors
- Primary: #0B0B0B
- Secondary: #1B1B1B
- Accent: #B89B72
- Muted Accent: #D8C7B5
- Background: #FAFAF8
- Surface: #FFFFFF
- Border: #E7E5E4
- Text Secondary: #666666

## Typography
- Headings: Instrument Serif
- Body Font: Inter
- Large cinematic headlines
- Serif nur für Premium-Emphasis
- Body text clean und editorial
- Headings semibold bis medium
- Max width content: 1200px
- Reading width: 720px
- Generous line-height und spacing

## Components
- Use shadcn/ui
- Rounded corners subtle (rounded-2xl max)
- Keine harten Schatten
- Soft borders statt heavy cards
- Buttons pill-shaped oder rounded-xl
- Cards use 32px padding
- Inputs minimal und clean
- Viel spacing zwischen Komponenten
- Components sollen editorial statt app-like wirken

## UX Rules
- Fokus auf ruhige User-Flows
- Keine überladenen Dashboards
- Forms max 1 primary action
- Navigation immer klar sichtbar auf Desktop
- Prefer inline validation
- Progressive disclosure statt Informationsflut
- Keine aggressiven Popups oder Modals
- Mobile experience priorisieren
- Große Touch Targets und klare Lesbarkeit