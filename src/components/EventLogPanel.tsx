import type { EventCategory, EventLogEntry } from "../types";

type EventLogPanelProps = {
  events: EventLogEntry[];
};

const categoryClasses: Record<EventCategory, string> = {
  MODE: "border-sky-300/25 bg-sky-300/10 text-sky-200",
  SIGNAL: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
  ADAPTIVE: "border-teal-300/25 bg-teal-300/10 text-teal-200",
  FAIRNESS: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  EMERGENCY: "border-red-300/35 bg-red-400/15 text-red-100",
  SYSTEM: "border-slate-300/20 bg-slate-300/10 text-slate-200",
};

function EventLogPanel({ events }: EventLogPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/82 p-5 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Decision Log
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">Scheduler Trace</h2>

      <div className="mt-5 grid max-h-[340px] gap-2 overflow-y-auto pr-1">
        {events.map((event) => (
          <div
            key={event.id}
            className={`rounded-lg border p-3 ${
              event.category === "EMERGENCY"
                ? "border-red-300/30 bg-red-500/12 shadow-[0_0_22px_rgba(248,113,113,0.12)]"
                : "border-white/10 bg-white/[0.045]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black text-teal-200">
                [{event.timestamp}]
              </p>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${categoryClasses[event.category]}`}
              >
                {event.category}
              </span>
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-200">
              {event.message}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventLogPanel;
