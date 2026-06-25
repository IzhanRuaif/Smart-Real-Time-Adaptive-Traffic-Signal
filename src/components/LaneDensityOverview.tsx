import { motion } from "framer-motion";
import type { Lane, LaneDensity, LaneWaitingCycles, SignalState } from "../types";

type LaneDensityOverviewProps = {
  activeLane: Lane;
  densities: LaneDensity;
  highestDensityLane: Lane;
  waitingCycles: LaneWaitingCycles;
  signals: SignalState;
  fairnessLane?: Lane;
  emergencyLane?: Lane;
};

const lanes: Lane[] = ["North", "East", "South", "West"];

function LaneDensityOverview({
  activeLane,
  densities,
  highestDensityLane,
  waitingCycles,
  signals,
  fairnessLane,
  emergencyLane,
}: LaneDensityOverviewProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/82 p-5 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Lane Density Overview
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">Sensor Snapshot</h2>

      <div className="mt-5 grid gap-3">
        {lanes.map((lane) => {
          const isHighest = lane === highestDensityLane;
          const isActive = lane === activeLane;
          const isFairnessPriority = lane === fairnessLane;
          const isEmergencyLane = lane === emergencyLane;
          const status = isEmergencyLane
            ? "Emergency"
            : isActive
              ? signals[lane]
              : signals[lane] === "red"
                ? "Red"
                : "Waiting";
          const width = `${(densities[lane] / 50) * 100}%`;

          return (
            <div
              key={lane}
              className={`rounded-lg border p-3 ${
                isEmergencyLane
                  ? "border-red-300/50 bg-red-500/15 shadow-[0_0_26px_rgba(248,113,113,0.18)]"
                  : isHighest
                  ? "border-teal-300/35 bg-teal-300/10"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{lane}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status: {status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">
                    {densities[lane]}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">
                    vehicles
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {isActive ? (
                  <span className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                    Active lane
                  </span>
                ) : (
                  <span className="rounded-md border border-slate-400/20 bg-slate-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    Waiting
                  </span>
                )}
                {isHighest ? (
                  <span className="rounded-md border border-teal-300/25 bg-teal-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-200">
                    Highest density
                  </span>
                ) : null}
                {isFairnessPriority ? (
                  <span className="rounded-md border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                    Fairness priority
                  </span>
                ) : null}
                {isEmergencyLane ? (
                  <span className="rounded-md border border-red-300/30 bg-red-300/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-100">
                    Emergency override
                  </span>
                ) : null}
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Waited {waitingCycles[lane]} cycles
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  About {waitingCycles[lane] * 8}s wait
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Signal {signals[lane]}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className={`h-full rounded-full ${
                    isHighest
                      ? "bg-gradient-to-r from-teal-300 to-lime-300"
                      : "bg-slate-500"
                  }`}
                  animate={{ width }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default LaneDensityOverview;
