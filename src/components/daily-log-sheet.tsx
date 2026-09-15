import type { DailyLog, DutyStatus, Trip } from "@/lib/types";
import { formatHours, formatLogDate } from "@/lib/format";

const rows: { key: DutyStatus; short: string; label: string }[] = [
  { key: "off_duty", short: "1", label: "Off Duty" },
  { key: "sleeper_berth", short: "2", label: "Sleeper Berth" },
  { key: "driving", short: "3", label: "Driving" },
  { key: "on_duty", short: "4", label: "On Duty (Not Driving)" },
];

const rowY: Record<DutyStatus, number> = {
  off_duty: 61,
  sleeper_berth: 101,
  driving: 141,
  on_duty: 181,
};

export const DailyLogSheet = ({ log, index, trip }: { log: DailyLog; index: number; trip: Trip }) => {
  const plotStart = 220;
  const plotWidth = 820;
  const xForMinute = (minute: number) => plotStart + (minute / 1440) * plotWidth;

  return (
    <article className="log-sheet">
      <div className="log-header">
        <div>
          <p className="eyebrow">Day {index + 1}</p>
          <h3>Driver&apos;s Daily Log</h3>
        </div>
        <div className="log-meta">
          <span>{formatLogDate(log.date, log.time_zone)}</span>
          <span>{log.time_zone}</span>
          <strong>{Number(log.total_miles).toLocaleString()} mi</strong>
        </div>
      </div>

      <div className="log-identification">
        <span><small>Driver</small>{trip.driver_name || "Not provided"}</span>
        <span><small>Carrier</small>{trip.carrier_name || "Not provided"}</span>
        <span><small>Vehicle</small>{trip.vehicle_numbers || "Not provided"}</span>
        <span><small>Shipping document</small>{trip.shipping_document_number || "Not provided"}</span>
      </div>

      <div className="log-scroll" aria-label={`Duty status graph for ${log.date}`}>
        <svg viewBox="0 0 1180 238" role="img" className="log-grid">
          <rect x="0" y="0" width="1180" height="238" rx="12" fill="#fffdf8" />
          {Array.from({ length: 25 }, (_, hour) => {
            const x = plotStart + (hour / 24) * plotWidth;
            return (
              <g key={hour}>
                <line
                  x1={x}
                  y1="42"
                  x2={x}
                  y2="201"
                  stroke={hour % 6 === 0 ? "#93a39f" : "#d8dfdc"}
                  strokeWidth={hour % 6 === 0 ? 1.2 : 0.7}
                />
                {hour < 24 && (
                  <text x={x + 3} y="28" className="hour-label">
                    {hour === 0 ? "Midnight" : hour === 12 ? "Noon" : hour}
                  </text>
                )}
              </g>
            );
          })}

          {rows.map((row, rowIndex) => (
            <g key={row.key}>
              <rect
                x="16"
                y={rowY[row.key] - 17}
                width="26"
                height="24"
                rx="7"
                fill="#173f3a"
              />
              <text x="29" y={rowY[row.key]} textAnchor="middle" className="row-number">
                {row.short}
              </text>
              {row.key === "on_duty" ? (
                <text x="50" y={rowY[row.key] - 5} className="row-label">
                  <tspan x="50">On Duty</tspan>
                  <tspan x="50" dy="12">(Not Driving)</tspan>
                </text>
              ) : (
                <text x="50" y={rowY[row.key]} className="row-label">
                  {row.label}
                </text>
              )}
              <line
                x1={plotStart}
                y1={rowY[row.key]}
                x2={plotStart + plotWidth}
                y2={rowY[row.key]}
                stroke="#b7c2be"
              />
              <text x="1090" y={rowY[row.key]} className="total-label">
                {formatHours(log.duty_totals_minutes[row.key])} hrs
              </text>
              {rowIndex < rows.length - 1 &&
                Array.from({ length: 96 }, (_, tick) => {
                  const x = plotStart + (tick / 96) * plotWidth;
                  return (
                    <line
                      key={tick}
                      x1={x}
                      y1={rowY[row.key] + 8}
                      x2={x}
                      y2={rowY[row.key] + (tick % 4 === 0 ? 18 : 13)}
                      stroke="#d8dfdc"
                      strokeWidth="0.65"
                    />
                  );
                })}
            </g>
          ))}

          {log.segments.map((segment, segmentIndex) => {
            const startX = xForMinute(segment.start_minute);
            const endX = xForMinute(segment.end_minute);
            const y = rowY[segment.duty_status];
            const previous = log.segments[segmentIndex - 1];
            const previousY = previous ? rowY[previous.duty_status] : y;

            return (
              <g key={`${segment.start_time}-${segmentIndex}`}>
                {segmentIndex > 0 && previousY !== y && (
                  <line
                    x1={startX}
                    y1={previousY}
                    x2={startX}
                    y2={y}
                    stroke="#e25f2d"
                    strokeWidth="4"
                  />
                )}
                <line
                  x1={startX}
                  y1={y}
                  x2={endX}
                  y2={y}
                  stroke="#e25f2d"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="log-remarks">
        <span>Remarks</span>
        <p>
          {log.segments
            .filter((segment) => segment.event_type !== "off_duty")
            .map((segment) => `${segment.remarks} · ${segment.location}`)
            .join("  /  ")}
        </p>
      </div>
    </article>
  );
};
