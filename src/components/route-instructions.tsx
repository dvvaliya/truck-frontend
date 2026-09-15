import { CornerDownRight, MapPinned } from "lucide-react";

import { formatEventDuration } from "@/lib/format";
import type { RouteGeometry } from "@/lib/types";

type RouteInstruction = NonNullable<RouteGeometry["properties"]["instructions"]>[number];

export const RouteInstructions = ({ instructions }: { instructions: RouteInstruction[] }) => {
  if (instructions.length === 0) return null;

  const legs = [
    { number: 1, label: "Current location to pickup" },
    { number: 2, label: "Pickup to drop-off" },
  ];

  return (
    <details
      className="mt-5 overflow-hidden rounded-[18px] border border-forest/10 bg-paper shadow-panel print:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 marker:hidden">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-heading-muted">
            Turn-by-turn
          </p>
          <h2 className="text-2xl font-bold tracking-[-.04em]">Route instructions</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-2 text-xs font-bold text-forest max-sm:hidden">
          <MapPinned className="size-4" />
          {instructions.length} steps
        </span>
      </summary>

      <div className="max-h-[460px] overflow-y-auto border-t border-line">
        {legs.map((leg) => {
          const legInstructions = instructions.filter((step) => step.leg === leg.number);
          if (legInstructions.length === 0) return null;

          return (
            <section key={leg.number}>
              <h3 className="sticky top-0 z-10 m-0 border-b border-line bg-surface-soft px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-forest">
                Leg {leg.number} · {leg.label}
              </h3>
              <ol className="divide-y divide-line px-6">
                {legInstructions.map((step) => {
                  const distance = Number(step.distance_miles);
                  const hasRoadName = step.road_name && step.road_name !== "-";

                  return (
                    <li
                      className="grid grid-cols-[32px_1fr_auto] items-start gap-3 py-3.5"
                      key={step.sequence}
                    >
                      <span className="grid size-8 place-items-center rounded-full bg-surface-soft text-forest">
                        <CornerDownRight className="size-4" />
                      </span>
                      <div>
                        <p className="m-0 text-sm font-bold text-ink">{step.instruction}</p>
                        {hasRoadName && (
                          <p className="mt-1 text-xs text-muted">{step.road_name}</p>
                        )}
                      </div>
                      {(distance > 0 || step.duration_minutes > 0) && (
                        <div className="text-right font-mono text-[11px] text-muted">
                          {distance > 0 && (
                            <strong className="block text-forest">
                              {distance.toFixed(1)} mi
                            </strong>
                          )}
                          {step.duration_minutes > 0 &&
                            formatEventDuration(step.duration_minutes)}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </details>
  );
};
