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
      <section className="relative z-10 overflow-visible bg-hero text-white print:hidden">
        <div className="mx-auto max-w-[1270px] px-5 sm:px-8">
        <nav className="relative z-20 flex min-h-20 items-center justify-between border-b border-white/10">
          <a className="inline-flex items-center gap-3 text-lg font-bold tracking-tight text-white no-underline" href="#top" aria-label="RoadLedger home">
            <span className="grid size-10 -rotate-3 place-items-center rounded-xl bg-orange">
              <Navigation className="size-5" />
            </span>
            <span>RoadLedger</span>
          </a>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-[11px] font-bold tracking-wide text-white/80">
            <ShieldCheck className="size-4" />
            FMCSA 70/8 planning
          </div>
        </nav>

        <div className="relative z-10 grid min-h-[630px] items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.8fr)] lg:gap-[72px] lg:py-[70px]" id="top">
          <div className="max-w-[670px]">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[.18em] text-orange">Route intelligence for the long haul</p>
            <h1 className="m-0 max-w-[680px] text-5xl font-bold leading-[.95] tracking-[-.065em] sm:text-6xl lg:text-[82px]">
              Plan the miles.
              <span className="block text-gold">Protect the clock.</span>
            </h1>
            <p className="my-7 max-w-xl text-base leading-7 text-hero-copy sm:text-lg">
              Build a compliant trip plan with required breaks, fuel stops, rest periods,
              and ready-to-read daily logs.
            </p>
            <div className="flex flex-wrap gap-5 text-xs text-hero-muted">
              <span className="flex items-baseline gap-1.5"><strong className="text-xl text-white">11h</strong> drive limit</span>
              <span className="flex items-baseline gap-1.5"><strong className="text-xl text-white">14h</strong> duty window</span>
              <span className="flex items-baseline gap-1.5"><strong className="text-xl text-white">70h</strong> eight-day cycle</span>
            </div>
          </div>

          <TripForm onTripCreated={setTrip} />
        </div>
        </div>
      </section>

      <div ref={resultsRef} tabIndex={-1} className="outline-none">
        {trip ? <TripResults trip={trip} /> : <EmptyPreview />}
      </div>
    </main>
  );
};
