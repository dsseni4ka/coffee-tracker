# SipSpend PWA

A mobile-first Progressive Web App for tracking coffee and matcha consumption, caffeine intake, brew locations, and sharing coffee moments.

**Project period:** June 1 – 18, 2025  
**Course:** Semester 4 personal project

## Features

- **Drink logging** — Quick grid of drink types (coffee + matcha) with size and caffeine estimate
- **Daily caffeine ring** — Visual tracker against 400 mg daily guideline
- **Coffee calendar** — Month view with drink history per day
- **Map** — Pins for drinks logged with geolocation
- **Report** — 7-day stats, caffeine chart, drink breakdown
- **Social feed** — Photo posts of coffee ceremonies (local storage)
- **Weather recommendations** — Drink suggestion via Open-Meteo API
- **PWA** — Installable, offline-capable via service worker

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + Vite |
| Routing | React Router |
| Storage | Dexie (IndexedDB) |
| Maps | Leaflet + OpenStreetMap |
| Weather | Open-Meteo (no API key) |
| PWA | vite-plugin-pwa |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 on your phone or in a mobile viewport.

Build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/   # Layout, nav, drink form
├── data/         # Drink types & caffeine presets
├── db/           # Dexie database layer
├── hooks/        # Weather recommendation, caffeine ring
├── pages/        # Log, Calendar, Map, Report, Feed
└── styles/       # Design tokens & global CSS
docs/
└── week1/        # Research & wireframe notes
```

## Design system

Tokens live in `src/styles/tokens.css`:

- **Espresso** `#3d2314` — primary
- **Cream** `#faf6f1` — background
- **Latte** `#d4a574` — accents
- **Matcha** `#7a9b6d` — secondary accent

## Documentation

See `docs/week1/` for problem statement, competitive analysis, MVP scope, and wireframe notes from the research phase.

## License

Personal academic project.
