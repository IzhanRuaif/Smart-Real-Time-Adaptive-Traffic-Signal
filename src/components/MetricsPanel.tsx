import type {
  DecisionKind,
  EmergencyOverride,
  Lane,
  LaneWaitingCycles,
  SignalColor,
  SystemMode,
} from "../types";

type MetricsPanelProps = {
  simTime: number;
  mode: SystemMode;
  completedPhases: number;
  emergencyOverridesHandled: number;
  waitingCycles: LaneWaitingCycles;
  mostCongestedLane: Lane;
  lastSelectedLane: Lane | null;
  activeLane: Lane;
  signalColor: SignalColor;
  decisionKind: DecisionKind;
  emergency: EmergencyOverride;
  isPaused: boolean;
};

const lanes: Lane[] = ["North", "East", "South", "West"];

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

function MetricsPanel({
  simTime,
  mode,
  completedPhases,
  emergencyOverridesHandled,
  waitingCycles,
  mostCongestedLane,
  lastSelectedLane,
  activeLane,
  signalColor,
  decisionKind,
  emergency,
  isPaused,
}: MetricsPanelProps) {
  const emergencyActive = emergency.phase !== "idle" && emergency.lane !== null;
  const averageWaitingCycles =
    lanes.reduce((total, lane) => total + waitingCycles[lane], 0) / lanes.length;
  const decisionLabel = emergencyActive
    ? "Emergency override"
    : mode === "fixed"
      ? "Fixed cycle"
      : decisionKind === "fairness"
        ? "Fairness priority"
        : "Highest density";

  const metrics = [
    { label: "Simulation time", value: formatTime(simTime) },
    {
      label: "Current mode",
      value: emergencyActive
        ? "Emergency Override"
        : mode === "fixed"
          ? "Fixed-Time"
          : "Adaptive Density",
    },
    { label: "Completed phases", value: completedPhases.toString() },
    {
      label: "Emergency overrides",
      value: emergencyOverridesHandled.toString(),
    },
    {
      label: "Average waiting",
      value: `${averageWaitingCycles.toFixed(1)} cycles`,
    },
    { label: "Most congested", value: mostCongestedLane },
    { label: "Last selected", value: lastSelectedLane ?? "None" },
    { label: "Current decision", value: decisionLabel },
  ];

  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/82 p-5 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Runtime Monitoring
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Metrics Panel</h2>
        </div>
        <span
          className={`rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-wide ${
            isPaused
              ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
              : "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
          }`}
        >
          {isPaused ? "Paused" : "Running"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="mt-1 text-base font-black text-white">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-sky-300/20 bg-sky-300/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-sky-100">
            {activeLane} lane
          </p>
          <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-100">
            {signalColor}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-sky-50/80">
          {lanes.map((lane) => (
            <span
              key={`wait-${lane}`}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1"
            >
              {lane}: {waitingCycles[lane]} cycles
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MetricsPanel;
