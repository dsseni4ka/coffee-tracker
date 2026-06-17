# Week 1 — Research & Ideation

**Dates:** June 1–7, 2025

## Problem statement

Coffee lovers (and matcha drinkers) lack a simple, mobile-first way to track daily caffeine, see brewing patterns over time, remember where they drank, and share coffee moments — without the complexity of full nutrition apps.

## Target user

Daily coffee or matcha drinker who wants awareness of caffeine intake and a visual diary of their coffee life.

## Competitive analysis

| App | Strengths | Gaps |
|-----|-----------|------|
| CoffeeLog | Drink icons, caffeine tracking, receipts | Heavy UI, limited social |
| MyFitnessPal | Full nutrition | Not coffee-focused |
| Untappd (analogy) | Location + social for beer | Not for coffee |

## MVP scope (June 18 demo)

**In scope:**
- Drink logging + caffeine
- Calendar history
- Map with locations
- Weekly report
- Basic photo feed
- Weather-based recommendation
- PWA install

**Out of scope (future work):**
- Home screen widget
- Full social network / following
- Café database with reviews API

## Tech decisions

- **React + Vite** — Fast dev, modern tooling
- **Dexie / IndexedDB** — Offline-first, no backend needed for demo
- **Leaflet + OSM** — Free maps, no API key
- **Open-Meteo** — Free weather, no key

## Wireframes (screen list)

1. **Log** — Drink grid, size picker, caffeine preview, today's list
2. **Calendar** — Month grid with dots, day detail panel
3. **Map** — Pins with drink popups
4. **Report** — Stats cards + bar charts
5. **Feed** — Photo + caption posts

## Information architecture

```
Bottom nav: Log | Calendar | Map | Report | Feed
```

Primary action: Log a drink (1–2 taps from home).
