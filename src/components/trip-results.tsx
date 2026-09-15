"use client";

import dynamic from "next/dynamic";
import { CalendarClock, CheckCircle2, Clock3, Printer, Route, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { DailyLogSheet } from "@/components/daily-log-sheet";
import { TripTimeline } from "@/components/trip-timeline";
import { formatDuration } from "@/lib/format";
import type { RouteGeometry, Trip } from "@/lib/types";

const RouteMap = dynamic(() => import("@/components/route-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[470px] w-full place-items-center bg-map-surface text-muted">
      Loading route map...
    </div>
  ),
});

export const EmptyPreview = () => (
  <section className="mx-auto w-[min(1220px,calc(100%_-_3rem))] px-6 py-24 text-center">
    <div className="mx-auto mb-8 flex w-[min(520px,85vw)] items-center justify-center" aria-hidden="true">
      <span className="size-4 shrink-0 rounded-full border-4 border-cream bg-forest ring-2 ring-forest" />
      <span className="h-0.5 w-[42%] bg-route-dash" />
      <span className="size-4 shrink-0 rounded-full border-4 border-cream bg-gold ring-2 ring-gold" />
      <span className="h-0.5 w-[28%] bg-route-dash" />
      <span className="size-4 shrink-0 rounded-full border-4 border-cream bg-orange ring-2 ring-orange" />
    </div>
    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-orange">Ready when you are</p>
    <h2 className="text-3xl font-bold tracking-tight text-ink">Your legal route will appear here</h2>
    <p className="mx-auto mt-3 text-muted-dark">Enter the trip details above to calculate every mile, stop, and duty change.</p>
  </section>
);

export const TripResults = ({ trip }: { trip: Trip }) => {
  const route = trip.route_geometry as RouteGeometry;
  const cycleRemaining = Math.max(0, 70 - Number(trip.current_cycle_used_hours));

  return (
    <div className="mx-auto w-[min(1220px,calc(100%_-_3rem))] py-16 print:w-full print:p-0">
      <section className="mb-7 flex items-end justify-between gap-4 print:hidden max-sm:flex-col max-sm:items-start">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-orange">Plan complete</p>
          <h2 className="max-w-3xl text-3xl font-bold tracking-[-.04em] sm:text-5xl">{trip.pickup_location} to {trip.dropoff_location}</h2>
        </div>
        <button className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-field-border bg-transparent px-4 font-extrabold text-forest transition hover:-translate-y-px" type="button" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print logs
        </button>
      </section>

      <section className="mb-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 print:hidden" aria-label="Trip summary">
        <Metric
          icon={<Route />}
          label="Route distance"
          value={`${Number(trip.distance_miles).toLocaleString()} mi`}
        />
        <Metric
          icon={<Clock3 />}
          label="Drive estimate"
          value={formatDuration(trip.estimated_duration_minutes)}
        />
        <Metric
          icon={<ShieldCheck />}
          label="Cycle available"
          value={`${cycleRemaining} hr`}
        />
        <Metric
          icon={<CalendarClock />}
          label="Daily logs"
          value={String(trip.daily_logs.length)}
        />
      </section>

      <section className="overflow-hidden rounded-[18px] border border-forest/10 bg-paper shadow-panel print:hidden" aria-labelledby="route-title">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-heading-muted">Route overview</p>
            <h2 className="text-2xl font-bold tracking-[-.04em]" id="route-title">Your planned run</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-field-border bg-surface-soft px-3 py-2 text-xs font-bold text-forest max-sm:hidden">
            <CheckCircle2 className="size-4" /> Compliant plan
          </span>
        </div>
        <RouteMap route={route} events={trip.events} />
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)] print:hidden">
        <TripTimeline events={trip.events} timeZone={trip.home_terminal_timezone} />
        <ClockSafeguards />
      </div>

      <section className="mt-16">
        <div className="flex items-center justify-between gap-4 py-5 print:hidden">
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-heading-muted">Record of duty status</p>
            <h2 className="text-2xl font-bold tracking-[-.04em]">Daily log sheets</h2>
          </div>
          <p className="text-sm text-muted">Each sheet totals 24 hours</p>
        </div>
        <div className="grid gap-5">
          {trip.daily_logs.map((log, index) => (
            <DailyLogSheet key={log.date} log={log} index={index} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
};

const ClockSafeguards = () => (
  <aside className="self-start rounded-[18px] border border-forest/10 bg-forest-deep p-6 text-white shadow-panel">
    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-gold">Built into this plan</p>
    <h2 className="text-2xl font-bold tracking-[-.04em]">Clock safeguards</h2>
    <ul className="mt-7 list-none p-0">
      {[
        ["01", "Driving limit", "Maximum 11 hours after a qualifying rest."],
        ["02", "Duty window", "No driving after the 14th consecutive hour."],
        ["03", "Required break", "30 minutes after 8 cumulative driving hours."],
        ["04", "Fuel planning", "A stop before each additional 1,000 miles."],
      ].map(([number, title, description]) => (
        <li className="grid grid-cols-[36px_1fr] gap-3.5 border-t border-white/10 py-4" key={number}>
          <span className="font-mono text-xs text-gold">{number}</span>
          <p className="m-0 text-[13px] leading-5 text-rule-muted"><strong className="mb-1 block text-white">{title}</strong>{description}</p>
        </li>
      ))}
    </ul>
  </aside>
);

type MetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

const Metric = ({ icon, label, value }: MetricProps) => (
  <article className="flex items-center gap-3.5 rounded-2xl border border-forest/10 bg-paper p-4 shadow-sm">
    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-soft text-orange [&>svg]:size-5">{icon}</span>
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <strong className="text-xl">{value}</strong>
    </div>
  </article>
);
