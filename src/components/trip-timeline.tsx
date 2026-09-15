import {
  BedDouble,
  Box,
  Coffee,
  Flag,
  Fuel,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";

import type { TripEvent } from "@/lib/types";
import { formatEventDuration, formatTime } from "@/lib/format";

const eventNames: Record<string, string> = {
  pre_trip: "Pre-trip inspection",
  pickup: "Pickup",
  driving: "Driving",
  break: "Required break",
  fuel: "Fuel stop",
  rest: "Sleeper rest",
  dropoff: "Drop-off",
  post_trip: "Post-trip inspection",
};

const eventIconClasses: Record<string, string> = {
  driving: "bg-forest text-white",
  pickup: "bg-orange text-white",
  dropoff: "bg-orange text-white",
  fuel: "bg-fuel-soft text-forest",
};

const EventIcon = ({ type }: { type: string }) => {
  const className = "size-4";
  if (type === "pickup") return <Box className={className} />;
  if (type === "dropoff") return <Flag className={className} />;
  if (type === "fuel") return <Fuel className={className} />;
  if (type === "break") return <Coffee className={className} />;
  if (type === "rest") return <BedDouble className={className} />;
  if (type === "driving") return <Navigation className={className} />;
  return <ShieldCheck className={className} />;
};

export const TripTimeline = ({ events, timeZone }: { events: TripEvent[]; timeZone: string }) => {
  return (
    <section className="rounded-[18px] border border-forest/10 bg-paper shadow-panel" aria-labelledby="timeline-title">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-heading-muted">Duty plan</p>
          <h2 className="text-2xl font-bold tracking-[-.04em]" id="timeline-title">Trip timeline</h2>
        </div>
        <span className="inline-flex items-center rounded-full border border-field-border bg-surface-soft px-3 py-2 text-xs font-bold text-forest max-sm:hidden">{events.length} events</span>
      </div>

      <ol className="max-h-[650px] list-none overflow-y-auto px-6 pb-7">
        {events.map((event) => (
          <li className="relative grid grid-cols-[38px_1fr] gap-3.5 pb-6 before:absolute before:top-[35px] before:bottom-0 before:left-[18px] before:w-px before:bg-field-border last:before:hidden" key={event.id}>
            <div className={`z-10 grid size-[38px] place-items-center rounded-full ${eventIconClasses[event.event_type] ?? "bg-timeline-icon text-forest"}`}>
              <EventIcon type={event.event_type} />
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="m-0 text-sm font-bold">{eventNames[event.event_type] ?? event.event_type}</h3>
                <span className="font-mono text-xs font-bold text-forest">{formatEventDuration(event.duration_minutes)}</span>
              </div>
              <p className="m-0 text-xs leading-5 text-muted">
                {formatTime(event.start_time, timeZone)} –{" "}
                {formatTime(event.end_time, timeZone)}
              </p>
              <p className="m-0 flex items-center gap-1 text-xs leading-5 text-muted">
                <MapPin className="size-3.5" />
                {event.location || "Along the planned route"}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
