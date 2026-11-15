# Niskala – Frontend

The web app for **Niskala**, a harmonized hotspot anomaly calendar for West Kalimantan, Indonesia. Built for **NASA Space Apps Challenge 2026**, Challenge #9: Harmonization of MODIS and VIIRS Hot Spots.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white)
![KaTeX](https://img.shields.io/badge/KaTeX-0.19-329894)
![Bun](https://img.shields.io/badge/Bun-package%20manager-000000?logo=bun&logoColor=white)

> **This app depends on the data-harmonization pipeline.** It does not process satellite data itself. All numbers come from JSON files produced by [`../data-harmonization`](../data-harmonization) and copied into `public/data/`.

## What it does

The app shows whether this month's fire hotspots in West Kalimantan and its 14 districts are normal or not, using one consistent record built from MODIS and VIIRS.

- **Landing page:** why harmonization is needed, with key results.
- **Calendar (`/calendar`):** year × month anomaly calendar, answer cards (when, how bad, where), district ranking, and the SiPongi ground check.
- **Date range and export:** choose a range, then download raw hotspots (CSV), a monthly summary (CSV), or a printable report (PDF).
- **Docs (`/docs`):** method, formulas, data characteristics, forecast model, and roadmap.

It is a static site: there is no backend or database.

## Getting started

Requirements: [Bun](https://bun.sh) (or Node.js 20+ with npm).

```bash
bun install
bun run dev        # http://localhost:5173
```

Other commands:

```bash
bun run build      # type-check and build to dist/
bun run preview    # serve the production build
bun run lint       # oxlint
```

## Updating the data

The files in `public/data/` come from the pipeline. To refresh them:

```bash
cd ../data-harmonization
python run_pipeline.py
cp -r data/web/* ../frontend/public/data/
```

| File            | Used for                                                    |
| :-------------- | :---------------------------------------------------------- |
| `meta.json`     | Region list, district ratios, normals, limitations, sources |
| `calendar.json` | Monthly harmonized counts, normals, ratios and classes      |
| `sipongi.json`  | Hotspots vs SiPongi burned area per year                    |
| `annual.json`   | Naive vs harmonized yearly totals                           |
| `points/`       | Raw hotspot points for the CSV download                     |

## Project structure

```
src/
├── components/   layout and shared UI (Card, Button, SelectDropdown)
├── constants/    colors, navigation, docs content
├── features/     landing and calendar components
├── hooks/        useNiskalaData (data loading and URL state)
├── pages/        Landing, Calendar, Docs, NotFound
├── routes/       app routes
├── services/     data loading and export helpers
└── types/        data types
```

## Use of AI

AI (Claude, by Anthropic and Gemini, by Google) was used to help write code. The page structure, features, design direction, and concepts came from the team. We worked human-in-the-loop: the team decided what to build, reviewed the generated code, and tested it in the browser before accepting it.
