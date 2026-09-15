"use client";

import { Navigation, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TripForm } from "@/components/trip-form";
import { EmptyPreview, TripResults } from "@/components/trip-results";
import type { Trip } from "@/lib/types";

export const TripPlanner = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trip) return;

    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    resultsRef.current?.focus({ preventScroll: true });
  }, [trip]);

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

          <TripForm onTripCreated={setTrip} />
        </div>
      </section>

      <div ref={resultsRef} tabIndex={-1} className="results-anchor">
        {trip ? <TripResults trip={trip} /> : <EmptyPreview />}
      </div>
    </main>
  );
};
