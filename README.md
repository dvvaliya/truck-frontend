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

## Project structure

```text
src/
├── app/                       # Page, layout, and global styles
├── components/
│   ├── trip-planner.tsx       # Coordinates form and result state
│   ├── trip-form.tsx          # Inputs and trip API submission
│   ├── trip-results.tsx       # Map, timeline, summary, and logs
│   ├── location-autocomplete.tsx
│   ├── route-map.tsx
│   ├── trip-timeline.tsx
│   └── daily-log-sheet.tsx
└── lib/                       # API client, types, and formatters
```

## Main interface

- Trip inputs for current location, pickup, drop-off, departure, and cycle hours
- Accessible custom date-time picker built with `@daypicker/react`
- Interactive OpenStreetMap route rendered with React Leaflet
- Trip distance, duration, cycle, and daily-log summary
- Chronological driving, pickup, break, fuel, rest, and drop-off timeline
- Responsive SVG daily-log sheets with print support

`@daypicker/react` was selected because it provides TypeScript support, keyboard accessibility, single-date selection, and full styling control without forcing a predefined visual design. Time selection and timezone conversion remain handled by the application's Moment Timezone utilities.
