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
  loading: () => <div className="map-loading">Loading route map...</div>,
});

export const EmptyPreview = () => (
  <section className="empty-preview">
    <div className="route-sketch" aria-hidden="true">
      <span className="sketch-dot start-dot" />
      <span className="sketch-line" />
      <span className="sketch-dot pickup-dot" />
      <span className="sketch-line second-line" />
      <span className="sketch-dot end-dot" />
    </div>
    <p className="eyebrow">Ready when you are</p>
    <h2>Your legal route will appear here</h2>
    <p>Enter the trip details above to calculate every mile, stop, and duty change.</p>
  </section>
);

export const TripResults = ({ trip }: { trip: Trip }) => {
  const route = trip.route_geometry as RouteGeometry;
  const cycleRemaining = Math.max(0, 70 - Number(trip.current_cycle_used_hours));

  return (
    <div className="results-shell">
      <section className="results-intro">
        <div>
          <p className="eyebrow">Plan complete</p>
          <h2>{trip.pickup_location} to {trip.dropoff_location}</h2>
        </div>
        <button className="secondary-button" type="button" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print logs
        </button>
      </section>

      <section className="metric-grid" aria-label="Trip summary">
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

      <section className="panel map-panel" aria-labelledby="route-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Route overview</p>
            <h2 id="route-title">Your planned run</h2>
          </div>
          <span className="route-status">
            <CheckCircle2 className="size-4" /> Compliant plan
          </span>
        </div>
        <RouteMap route={route} events={trip.events} />
      </section>

      <div className="details-grid">
        <TripTimeline events={trip.events} timeZone={trip.home_terminal_timezone} />
        <ClockSafeguards />
      </div>

      <section className="logs-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Record of duty status</p>
            <h2>Daily log sheets</h2>
          </div>
          <p className="section-note">Each sheet totals 24 hours</p>
        </div>
        <div className="logs-list">
          {trip.daily_logs.map((log, index) => (
            <DailyLogSheet key={log.date} log={log} index={index} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
};

const ClockSafeguards = () => (
  <aside className="panel rules-panel">
    <p className="eyebrow">Built into this plan</p>
    <h2>Clock safeguards</h2>
    <ul>
      {[
        ["01", "Driving limit", "Maximum 11 hours after a qualifying rest."],
        ["02", "Duty window", "No driving after the 14th consecutive hour."],
        ["03", "Required break", "30 minutes after 8 cumulative driving hours."],
        ["04", "Fuel planning", "A stop before each additional 1,000 miles."],
      ].map(([number, title, description]) => (
        <li key={number}>
          <span>{number}</span>
          <p><strong>{title}</strong>{description}</p>
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
  <article className="metric-card">
    <span className="metric-icon">{icon}</span>
    <div>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  </article>
);
