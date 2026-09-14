# RoadLedger Frontend

Next.js and TypeScript frontend for planning property-carrying truck routes and displaying FMCSA duty schedules.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. The Django API must be running on `http://localhost:8000` unless `NEXT_PUBLIC_API_BASE_URL` is changed.

## Commands

```bash
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Main interface

- Trip inputs for current location, pickup, drop-off, departure, and cycle hours
- Interactive OpenStreetMap route rendered with React Leaflet
- Trip distance, duration, cycle, and daily-log summary
- Chronological driving, pickup, break, fuel, rest, and drop-off timeline
- Responsive SVG daily-log sheets with print support
