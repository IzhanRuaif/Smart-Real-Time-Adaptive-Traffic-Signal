import { motion } from "framer-motion";
import type {
  DecisionKind,
  EmergencyOverride,
  Lane,
  SignalColor,
  SystemMode,
} from "../types";

type DashboardProps = {
  mode: SystemMode;
  activeLane: Lane;
  signalColor: SignalColor;
  countdown: number;
  phaseDuration: number;
  greenDuration: number;
  decisionKind: DecisionKind;
  decisionReason?: string;
  emergency: EmergencyOverride;
  isPaused: boolean;
};

const colorClasses: Record<SignalColor, string> = {
  red: "text-red-300 bg-red-400/10 border-red-300/25",
  yellow: "text-yellow-200 bg-yellow-300/10 border-yellow-300/25",
  green: "text-emerald-300 bg-emerald-300/10 border-emerald-300/25",
};

const legendItems: Array<{ color: SignalColor; label: string; className: string }> = [
  { color: "red", label: "Stop", className: "bg-red-400 shadow-signalRed" },
  { color: "yellow", label: "Ready", className: "bg-yellow-300 shadow-signalYellow" },
  { color: "green", label: "Go", className: "bg-emerald-400 shadow-signalGreen" },
];

function Dashboard({
  mode,
  activeLane,
  signalColor,
  countdown,
  phaseDuration,
  greenDuration,
  decisionKind,
  decisionReason,
  emergency,
  isPaused,
}: DashboardProps) {
  const progress = Math.max(0, Math.min(100, (countdown / phaseDuration) * 100));
  const emergencyActive = emergency.phase !== "idle" && emergency.lane !== null;
  const decisionBadge =
    decisionKind === "fairness"
      ? "Fairness Priority"
      : decisionKind === "similarity"
        ? "Anti-Starvation"
        : "Highest Density";
  const emergencyReason =
    emergency.phase === "transition"
      ? `Safe transition started: ${emergency.transitionLane} changed to yellow before granting priority.`
      : emergency.phase === "clearance"
        ? "All non-emergency lanes are held red for clearance."
        : emergency.phase === "granted"
          ? `${emergency.lane} has highest priority until the emergency vehicle clears.`
          : undefined;
  const selectedModeLabel =
    mode === "fixed" ? "Fixed-Time Mode" : "Adaptive Density Mode";

  return (
    <aside className="rounded-lg border border-white/10 bg-slate-900/82 p-5 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Controller
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">Signal Dashboard</h2>
        </div>
        <span
          className={`rounded-md border px-3 py-1 text-xs font-semibold ${
            isPaused
              ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
              : "border-teal-300/20 bg-teal-300/10 text-teal-200"
          }`}
        >
          {isPaused ? "Paused" : "Live"}
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400">Current phase</p>
            <span className="rounded-md border border-teal-300/25 bg-teal-300/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-200">
              {activeLane}
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-white">
            {activeLane} {signalColor.toUpperCase()}
          </p>
        </div>

        <div className={`rounded-lg border p-4 ${colorClasses[signalColor]}`}>
          <p className="text-sm opacity-80">Current signal color</p>
          <div className="mt-3 flex items-center gap-3">
            <motion.span
              className="h-5 w-5 rounded-full bg-current"
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="text-3xl font-black capitalize">{signalColor}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400">Countdown timer</p>
            <span className="text-xs font-semibold text-slate-500">
              {phaseDuration}s phase
            </span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <motion.p
              key={countdown}
              className="text-6xl font-black text-white"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {countdown}
            </motion.p>
            <span className="pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              sec
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-300 via-emerald-300 to-lime-300"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        {emergencyActive ? (
          <motion.div
            className="rounded-lg border border-red-300/45 bg-red-500/15 p-4 shadow-[0_0_30px_rgba(248,113,113,0.2)]"
            animate={{ boxShadow: ["0 0 18px rgba(248,113,113,0.18)", "0 0 36px rgba(248,113,113,0.38)", "0 0 18px rgba(248,113,113,0.18)"] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-100">
              Emergency active
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {emergency.lane} Override
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-red-50">
              <span className="rounded-md border border-red-200/20 bg-red-200/10 px-2 py-1">
                Status: Emergency Override
              </span>
              <span className="rounded-md border border-red-200/20 bg-red-200/10 px-2 py-1">
                Timer: {emergency.countdown}s
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-red-50/90">
              {emergencyReason}
            </p>
          </motion.div>
        ) : null}

        <div
          className={`rounded-lg border p-4 ${
            emergencyActive
              ? "border-red-300/30 bg-red-300/10"
              : "border-sky-300/20 bg-sky-300/10"
          }`}
        >
          <p className="text-sm text-sky-100/70">System mode</p>
          <p className="mt-2 text-xl font-bold text-sky-100">
            {emergencyActive ? "Emergency Override" : selectedModeLabel}
          </p>
          {emergencyActive ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-red-100/75">
              Resume target: {selectedModeLabel}
            </p>
          ) : isPaused ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-100/75">
              Scheduling timer paused
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-teal-300/20 bg-teal-300/10 p-4">
          <p className="text-sm text-teal-100/70">Current green duration</p>
          <p className="mt-2 text-2xl font-black text-teal-100">
            {greenDuration} seconds
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400">Decision reason</p>
            {mode === "adaptive" ? (
              <span className="rounded-md border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                {decisionBadge}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-200">
            {decisionReason ??
              "Fixed-time cycle is running in a preset North, East, South, West order."}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
          <p className="text-sm font-semibold text-slate-300">Signal legend</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {legendItems.map((item) => (
              <div
                key={item.color}
                className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-2 text-center"
              >
                <span
                  className={`mx-auto block h-3 w-3 rounded-full ${item.className}`}
                />
                <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Dashboard;
