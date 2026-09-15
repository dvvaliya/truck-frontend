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
    <article className="overflow-hidden rounded-2xl border border-forest/10 bg-paper p-6 shadow-panel print:min-h-[95vh] print:break-after-page print:border-0 print:shadow-none max-sm:px-0">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4 max-sm:mx-4 max-sm:flex-col max-sm:items-start">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-heading-muted">Day {index + 1}</p>
          <h3 className="m-0 text-xl font-bold tracking-tight">Driver&apos;s Daily Log</h3>
        </div>
        <div className="flex items-center justify-between gap-4 font-mono text-[11px] text-meta max-sm:flex-wrap max-sm:items-start">
          <span>{formatLogDate(log.date, log.time_zone)}</span>
          <span>{log.time_zone}</span>
          <strong className="rounded-lg bg-surface-soft px-2.5 py-2 text-forest">{Number(log.total_miles).toLocaleString()} mi</strong>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 px-0 pt-3.5 pb-1 text-xs text-identity-text max-sm:mx-4 max-sm:grid-cols-1">
        <LogIdentity label="Driver" value={trip.driver_name} />
        <LogIdentity label="Carrier" value={trip.carrier_name} />
        <LogIdentity label="Vehicle" value={trip.vehicle_numbers} />
        <LogIdentity label="Shipping document" value={trip.shipping_document_number} />
      </div>

      <div className="overflow-x-auto" aria-label={`Duty status graph for ${log.date}`}>
        <svg viewBox="0 0 1180 238" role="img" className="block min-w-[920px]">
          <rect className="fill-paper" x="0" y="0" width="1180" height="238" rx="12" />
          {Array.from({ length: 25 }, (_, hour) => {
            const x = plotStart + (hour / 24) * plotWidth;
            return (
              <g key={hour}>
                <line
                  x1={x}
                  y1="42"
                  x2={x}
                  y2="201"
                  className={hour % 6 === 0 ? "stroke-grid-strong" : "stroke-grid"}
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
                className="fill-forest"
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
                className="stroke-sage"
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
                      className="stroke-grid"
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
                    className="stroke-orange"
                    strokeWidth="4"
                  />
                )}
                <line
                  x1={startX}
                  y1={y}
                  x2={endX}
                  y2={y}
                  className="stroke-orange"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-[100px_1fr] gap-4 border-t border-line px-4 py-3.5 text-[11px] leading-5 text-meta max-sm:mx-4 max-sm:grid-cols-1">
        <span className="font-extrabold uppercase text-ink">Remarks</span>
        <p className="m-0">
          {log.segments
            .filter((segment) => segment.event_type !== "off_duty")
            .map((segment) => `${segment.remarks} · ${segment.location}`)
            .join("  /  ")}
        </p>
      </div>
    </article>
  );
};

const LogIdentity = ({ label, value }: { label: string; value: string }) => (
  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
    <small className="mb-1 block text-[9px] font-extrabold uppercase tracking-wider text-muted">
      {label}
    </small>
    {value || "Not provided"}
  </span>
);
