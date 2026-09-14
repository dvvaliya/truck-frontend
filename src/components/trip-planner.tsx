"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  Navigation,
  Printer,
  Route,
  ShieldCheck,
} from "lucide-react";

import { DailyLogSheet } from "@/components/daily-log-sheet";
import { TripTimeline } from "@/components/trip-timeline";
import { ApiError, createTrip } from "@/lib/api";
import type { CreateTripInput, RouteGeometry, Trip } from "@/lib/types";

const RouteMap = dynamic(() => import("@/components/route-map"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading route map...</div>,
});

const initialForm = {
  current_location: "",
  pickup_location: "",
  dropoff_location: "",
  departure_time: "",
  current_cycle_used_hours: "0",
};

function formatDuration(minutes: number | null) {
  if (minutes === null) return "—";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function TripPlanner() {
  const [form, setForm] = useState(initialForm);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const departure = new Date(form.departure_time);
    if (Number.isNaN(departure.getTime())) {
      setError("Choose a valid departure date and time.");
      setIsLoading(false);
      return;
    }

    const input: CreateTripInput = {
      ...form,
      departure_time: departure.toISOString().replace(/:\d{2}\.\d{3}Z$/, ":00Z"),
    };

    try {
      const result = await createTrip(input);
      setTrip(result);
    } catch (requestError) {
      setTrip(null);
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Something went wrong while planning the trip.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <section className="hero-shell">
        <nav className="topbar">
          <a className="brand" href="#top" aria-label="RoadLedger home">
            <span className="brand-mark">
              <Navigation className="size-5" />
            </span>
            <span>RoadLedger</span>
          </a>
          <div className="regulation-badge">
            <ShieldCheck className="size-4" />
            FMCSA 70/8 planning
          </div>
        </nav>

        <div className="hero" id="top">
          <div className="hero-copy">
            <p className="hero-kicker">Route intelligence for the long haul</p>
            <h1>
              Plan the miles.
              <span>Protect the clock.</span>
            </h1>
            <p className="hero-description">
              Build a compliant trip plan with required breaks, fuel stops, rest periods,
              and ready-to-read daily logs.
            </p>
            <div className="hero-facts">
              <span><strong>11h</strong> drive limit</span>
              <span><strong>14h</strong> duty window</span>
              <span><strong>70h</strong> eight-day cycle</span>
            </div>
          </div>

          <form className="planner-card" onSubmit={handleSubmit}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">New dispatch</p>
                <h2>Build your trip plan</h2>
              </div>
              <span className="step-number">01</span>
            </div>

            <LocationInput
              icon={<Navigation className="size-4" />}
              label="Current location"
              placeholder="Chicago, IL"
              value={form.current_location}
              onChange={(value) => setForm({ ...form, current_location: value })}
            />
            <LocationInput
              className="pickup-input"
              icon={<MapPin className="size-4" />}
              label="Pickup location"
              placeholder="Milwaukee, WI"
              value={form.pickup_location}
              onChange={(value) => setForm({ ...form, pickup_location: value })}
            />
            <LocationInput
              className="dropoff-input"
              icon={<MapPin className="size-4" />}
              label="Drop-off location"
              placeholder="Dallas, TX"
              value={form.dropoff_location}
              onChange={(value) => setForm({ ...form, dropoff_location: value })}
            />

            <div className="form-row">
              <label>
                <span>Departure</span>
                <div className="input-shell">
                  <CalendarClock className="size-4" />
                  <input
                    required
                    type="datetime-local"
                    step="60"
                    value={form.departure_time}
                    onChange={(event) =>
                      setForm({ ...form, departure_time: event.target.value })
                    }
                  />
                </div>
              </label>
              <label>
                <span>Cycle used</span>
                <div className="input-shell">
                  <Clock3 className="size-4" />
                  <input
                    required
                    type="number"
                    min="0"
                    max="70"
                    step="0.25"
                    value={form.current_cycle_used_hours}
                    onChange={(event) =>
                      setForm({ ...form, current_cycle_used_hours: event.target.value })
                    }
                  />
                  <small>hrs</small>
                </div>
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="primary-button" disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" />
                  Building legal route...
                </>
              ) : (
                <>
                  Generate trip plan
                  <ArrowRight className="size-5" />
                </>
              )}
            </button>
            <p className="form-note">No login required. Times are shown in UTC.</p>
          </form>
        </div>
      </section>

      {trip ? <TripResults trip={trip} /> : <EmptyPreview />}
    </main>
  );
}

function LocationInput({
  className = "",
  icon,
  label,
  placeholder,
  value,
  onChange,
}: {
  className?: string;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <div className={`input-shell ${className}`}>
        {icon}
        <input
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}

function EmptyPreview() {
  return (
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
}

function TripResults({ trip }: { trip: Trip }) {
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
        <Metric icon={<Route />} label="Route distance" value={`${Number(trip.distance_miles).toLocaleString()} mi`} />
        <Metric icon={<Clock3 />} label="Drive estimate" value={formatDuration(trip.estimated_duration_minutes)} />
        <Metric icon={<ShieldCheck />} label="Cycle available" value={`${cycleRemaining} hr`} />
        <Metric icon={<CalendarClock />} label="Daily logs" value={String(trip.daily_logs.length)} />
      </section>

      <section className="panel map-panel" aria-labelledby="route-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Route overview</p>
            <h2 id="route-title">Your planned run</h2>
          </div>
          <span className="route-status"><CheckCircle2 className="size-4" /> Compliant plan</span>
        </div>
        <RouteMap route={route} />
      </section>

      <div className="details-grid">
        <TripTimeline events={trip.events} />
        <aside className="panel rules-panel">
          <p className="eyebrow">Built into this plan</p>
          <h2>Clock safeguards</h2>
          <ul>
            <li><span>01</span><p><strong>Driving limit</strong>Maximum 11 hours after a qualifying rest.</p></li>
            <li><span>02</span><p><strong>Duty window</strong>No driving after the 14th consecutive hour.</p></li>
            <li><span>03</span><p><strong>Required break</strong>30 minutes after 8 cumulative driving hours.</p></li>
            <li><span>04</span><p><strong>Fuel planning</strong>A stop before each additional 1,000 miles.</p></li>
          </ul>
        </aside>
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
            <DailyLogSheet key={log.date} log={log} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="metric-card">
      <span className="metric-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
