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

function EventIcon({ type }: { type: string }) {
  const className = "size-4";
  if (type === "pickup") return <Box className={className} />;
  if (type === "dropoff") return <Flag className={className} />;
  if (type === "fuel") return <Fuel className={className} />;
  if (type === "break") return <Coffee className={className} />;
  if (type === "rest") return <BedDouble className={className} />;
  if (type === "driving") return <Navigation className={className} />;
  return <ShieldCheck className={className} />;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function TripTimeline({ events }: { events: TripEvent[] }) {
  return (
    <section className="panel timeline-panel" aria-labelledby="timeline-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Duty plan</p>
          <h2 id="timeline-title">Trip timeline</h2>
        </div>
        <span className="count-pill">{events.length} events</span>
      </div>

      <ol className="timeline-list">
        {events.map((event) => (
          <li className="timeline-event" key={event.id}>
            <div className={`event-icon event-${event.event_type}`}>
              <EventIcon type={event.event_type} />
            </div>
            <div className="event-copy">
              <div className="event-title-row">
                <h3>{eventNames[event.event_type] ?? event.event_type}</h3>
                <span>{formatDuration(event.duration_minutes)}</span>
              </div>
              <p className="event-time">
                {formatTime(event.start_time)} – {formatTime(event.end_time)}
              </p>
              <p className="event-location">
                <MapPin className="size-3.5" />
                {event.location || "Along the planned route"}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
