import { motion } from "framer-motion";
import TrafficLight from "./TrafficLight";
import Vehicle from "./Vehicle";
import type { EmergencyPhase, Lane, LaneDensity, SignalState } from "../types";

type IntersectionProps = {
  signals: SignalState;
  densities: LaneDensity;
  emergencyLane?: Lane;
  emergencyPhase: EmergencyPhase;
  isPaused: boolean;
};

const lanes: Lane[] = ["North", "East", "South", "West"];

const vehicleTemplates = {
  North: [
    { color: "bg-cyan-400", type: "car" },
    { color: "bg-sky-500", type: "van" },
    { color: "bg-indigo-400", type: "car" },
    { color: "bg-teal-400", type: "bus" },
    { color: "bg-blue-300", type: "car" },
  ],
  East: [
    { color: "bg-fuchsia-400", type: "car" },
    { color: "bg-violet-500", type: "bus" },
    { color: "bg-pink-400", type: "van" },
    { color: "bg-purple-300", type: "car" },
    { color: "bg-rose-300", type: "car" },
  ],
  South: [
    { color: "bg-lime-400", type: "car" },
    { color: "bg-emerald-500", type: "van" },
    { color: "bg-green-300", type: "car" },
    { color: "bg-cyan-300", type: "bus" },
    { color: "bg-lime-300", type: "car" },
  ],
  West: [
    { color: "bg-orange-400", type: "car" },
    { color: "bg-rose-500", type: "bus" },
    { color: "bg-amber-300", type: "van" },
    { color: "bg-red-400", type: "car" },
    { color: "bg-yellow-300", type: "car" },
  ],
} satisfies Record<Lane, Array<{ color: string; type: "car" | "bus" | "van" }>>;

const crossingBars = Array.from({ length: 7 }, (_, index) => index);

const emergencyHighlightClasses: Record<Lane, string> = {
  North: "left-[32%] top-0 h-[32%] w-[36%]",
  East: "right-0 top-[32%] h-[36%] w-[32%]",
  South: "bottom-0 left-[32%] h-[32%] w-[36%]",
  West: "left-0 top-[32%] h-[36%] w-[32%]",
};

const emergencyVehiclePaths: Record<
  Lane,
  {
    className: string;
    start: { x: string; y: string };
    wait: { x: string; y: string };
    end: { x: string; y: string };
    rotate: number;
  }
> = {
  North: {
    className: "left-[56%] top-[18%]",
    start: { x: "-50%", y: "-640%" },
    wait: { x: "-50%", y: "-50%" },
    end: { x: "-50%", y: "1560%" },
    rotate: 180,
  },
  South: {
    className: "left-[44%] top-[82%]",
    start: { x: "-50%", y: "640%" },
    wait: { x: "-50%", y: "-50%" },
    end: { x: "-50%", y: "-1660%" },
    rotate: 0,
  },
  East: {
    className: "left-[82%] top-[56%]",
    start: { x: "640%", y: "-50%" },
    wait: { x: "-50%", y: "-50%" },
    end: { x: "-1760%", y: "-50%" },
    rotate: -90,
  },
  West: {
    className: "left-[18%] top-[44%]",
    start: { x: "-640%", y: "-50%" },
    wait: { x: "-50%", y: "-50%" },
    end: { x: "1660%", y: "-50%" },
    rotate: 90,
  },
};

const getVisibleVehicleCount = (density: number) => {
  if (density <= 10) return 1;
  if (density <= 20) return 2;
  if (density <= 30) return 3;
  if (density <= 40) return 4;
  return 5;
};

// Real on-screen length (matches Vehicle.tsx's typeSize "h-*" classes) used to
// compute queue spacing. A flat gap previously caused vehicles to overlap
// whenever a van/bus was queued, since the gap was smaller than the vehicles.
const vehicleLengthPx: Record<"car" | "van" | "bus", number> = {
  car: 36,
  van: 40,
  bus: 48,
};
const QUEUE_BUFFER_PX = 16;

// Returns each vehicle's offset from the stop line as the cumulative length
// of every vehicle ahead of it (plus a fixed buffer), so spacing always
// reflects the actual queue regardless of car/van/bus mix.
const buildQueueGaps = (lane: Lane, count: number) => {
  let cumulative = 0;
  return Array.from({ length: count }, (_, index) => {
    const gap = cumulative;
    const vehicle = vehicleTemplates[lane][index];
    cumulative += vehicleLengthPx[vehicle.type] + QUEUE_BUFFER_PX;
    return gap;
  });
};

function EmergencyVehicle({
  lane,
  phase,
  isPaused,
}: {
  lane: Lane;
  phase: EmergencyPhase;
  isPaused: boolean;
}) {
  const path = emergencyVehiclePaths[lane];
  const isMoving = phase === "granted" && !isPaused;

  return (
    <motion.div
      key={`${lane}-${phase}`}
      className={`absolute z-40 h-14 w-7 ${path.className}`}
      style={{ rotate: path.rotate }}
      initial={isMoving ? path.start : path.wait}
      animate={
        isMoving
          ? {
              x: [path.start.x, path.wait.x, path.end.x],
              y: [path.start.y, path.wait.y, path.end.y],
              opacity: [0.95, 1, 0.95],
            }
          : {
              x: path.wait.x,
              y: path.wait.y,
              opacity: 1,
            }
      }
      transition={{
        duration: isMoving ? 9.4 : 0.35,
        ease: "linear",
        times: isMoving ? [0, 0.22, 1] : undefined,
      }}
    >
      <div className="relative h-full w-full rounded-md border-2 border-red-200 bg-white shadow-[0_0_30px_rgba(248,113,113,0.8)]">
        <span className="absolute inset-x-1 top-1 h-[24%] rounded-sm bg-sky-200/85" />
        <span className="absolute inset-x-1 bottom-1 h-[20%] rounded-sm bg-slate-800/70" />
        <span className="absolute left-1/2 top-[38%] h-4 w-1 -translate-x-1/2 rounded bg-red-500" />
        <span className="absolute left-1/2 top-[44%] h-1 w-4 -translate-x-1/2 rounded bg-red-500" />
        <motion.span
          className="absolute left-1/2 -top-1 h-2.5 w-4 -translate-x-1/2 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

function Intersection({
  signals,
  densities,
  emergencyLane,
  emergencyPhase,
  isPaused,
}: IntersectionProps) {
  const emergencyActive = emergencyPhase !== "idle" && emergencyLane !== undefined;

  return (
    <section
      className={`relative overflow-hidden rounded-lg border bg-slate-900/74 p-3 shadow-2xl backdrop-blur sm:p-5 ${
        emergencyActive
          ? "border-red-300/40 shadow-[0_0_38px_rgba(248,113,113,0.22)]"
          : "border-white/10"
      }`}
    >
      <div className="relative mx-auto aspect-square w-full max-w-[760px] overflow-hidden rounded-lg border border-slate-700/70 bg-[linear-gradient(135deg,#0f172a,#020617)]">
        {emergencyActive ? (
          <motion.div
            className="absolute left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-md border border-red-200/35 bg-red-500/90 px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_28px_rgba(248,113,113,0.5)]"
            animate={{ opacity: [0.82, 1, 0.82] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          >
            Emergency Override Active
          </motion.div>
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08),transparent_42%)]" />
        <div className="absolute left-[32%] top-0 h-full w-[36%] bg-slate-800 shadow-[inset_10px_0_24px_rgba(255,255,255,0.035),inset_-10px_0_24px_rgba(0,0,0,0.35)]" />
        <div className="absolute left-0 top-[32%] h-[36%] w-full bg-slate-800 shadow-[inset_0_10px_24px_rgba(255,255,255,0.035),inset_0_-10px_24px_rgba(0,0,0,0.35)]" />
        {emergencyActive ? (
          <motion.div
            className={`absolute z-10 rounded-lg bg-red-400/20 ring-2 ring-red-200/45 ${emergencyHighlightClasses[emergencyLane]}`}
            animate={{ opacity: [0.35, 0.82, 0.35] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
        <div className="absolute left-[48.8%] top-0 h-[29%] w-1 border-l-2 border-dashed border-yellow-200/70" />
        <div className="absolute left-[48.8%] bottom-0 h-[29%] w-1 border-l-2 border-dashed border-yellow-200/70" />
        <div className="absolute left-0 top-[48.8%] h-1 w-[29%] border-t-2 border-dashed border-yellow-200/70" />
        <div className="absolute right-0 top-[48.8%] h-1 w-[29%] border-t-2 border-dashed border-yellow-200/70" />

        <div className="absolute left-[32%] top-[32%] h-[36%] w-[36%] bg-slate-700" />
        <div className="absolute left-[38%] top-[38%] h-[24%] w-[24%] rounded-md border border-yellow-200/45 bg-slate-800/90 shadow-inner" />
        <div className="absolute left-[40%] top-[40%] h-[20%] w-[20%] rounded border border-dashed border-yellow-100/35" />

        <div className="absolute left-[32%] top-[29%] h-1 w-[36%] bg-white/80" />
        <div className="absolute left-[32%] bottom-[29%] h-1 w-[36%] bg-white/80" />
        <div className="absolute left-[29%] top-[32%] h-[36%] w-1 bg-white/80" />
        <div className="absolute right-[29%] top-[32%] h-[36%] w-1 bg-white/80" />

        <div className="absolute left-[35%] top-[23%] flex w-[30%] justify-between">
          {crossingBars.map((bar) => (
            <span key={`north-crossing-${bar}`} className="h-7 w-2 bg-white/80" />
          ))}
        </div>
        <div className="absolute bottom-[23%] left-[35%] flex w-[30%] justify-between">
          {crossingBars.map((bar) => (
            <span key={`south-crossing-${bar}`} className="h-7 w-2 bg-white/80" />
          ))}
        </div>
        <div className="absolute left-[23%] top-[35%] flex h-[30%] flex-col justify-between">
          {crossingBars.map((bar) => (
            <span key={`west-crossing-${bar}`} className="h-2 w-7 bg-white/80" />
          ))}
        </div>
        <div className="absolute right-[23%] top-[35%] flex h-[30%] flex-col justify-between">
          {crossingBars.map((bar) => (
            <span key={`east-crossing-${bar}`} className="h-2 w-7 bg-white/80" />
          ))}
        </div>

        <span className="absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-md border border-white/10 bg-slate-950/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">
          North
        </span>
        <span className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-md border border-white/10 bg-slate-950/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">
          South
        </span>
        <span className="absolute left-3 top-1/2 z-30 -translate-y-1/2 -rotate-90 rounded-md border border-white/10 bg-slate-950/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">
          West
        </span>
        <span className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rotate-90 rounded-md border border-white/10 bg-slate-950/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">
          East
        </span>

        <div className="absolute left-[39%] top-[30%] z-30 origin-center scale-75 sm:scale-100">
          <TrafficLight activeColor={signals.North} label="North" />
        </div>
        <div className="absolute right-[30%] top-[39%] z-30 origin-center scale-75 sm:scale-100">
          <TrafficLight
            activeColor={signals.East}
            direction="horizontal"
            label="East"
          />
        </div>
        <div className="absolute bottom-[30%] right-[39%] z-30 origin-center scale-75 sm:scale-100">
          <TrafficLight activeColor={signals.South} label="South" />
        </div>
        <div className="absolute bottom-[39%] left-[30%] z-30 origin-center scale-75 sm:scale-100">
          <TrafficLight
            activeColor={signals.West}
            direction="horizontal"
            label="West"
          />
        </div>

        {lanes.map((lane) => {
          const count = getVisibleVehicleCount(densities[lane]);
          const gaps = buildQueueGaps(lane, count);

          return gaps.map((gapPx, index) => {
            const vehicle = vehicleTemplates[lane][index];

            return (
              <Vehicle
                key={`${lane}-${vehicle.color}`}
                lane={lane}
                canMove={signals[lane] === "green" && !isPaused}
                color={vehicle.color}
                type={vehicle.type}
                gapPx={gapPx}
                delay={index * 0.65}
              />
            );
          });
        })}

        {emergencyActive ? (
          <EmergencyVehicle
            lane={emergencyLane}
            phase={emergencyPhase}
            isPaused={isPaused}
          />
        ) : null}

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_28%,rgba(2,6,23,0.34)_72%)]" />
      </div>
    </section>
  );
}

export default Intersection;