import type { Lane, LaneDensity, SimulationSpeed, SystemMode } from "../types";

type DensityControlPanelProps = {
  mode: SystemMode;
  densities: LaneDensity;
  emergencyActive: boolean;
  isPaused: boolean;
  simulationSpeed: SimulationSpeed;
  onModeChange: (mode: SystemMode) => void;
  onDensityChange: (lane: Lane, value: number) => void;
  onEmergencyTrigger: (lane: Lane) => void;
  onPauseToggle: () => void;
  onReset: () => void;
  onSpeedChange: (speed: SimulationSpeed) => void;
};

const lanes: Lane[] = ["North", "East", "South", "West"];

function DensityControlPanel({
  mode,
  densities,
  emergencyActive,
  isPaused,
  simulationSpeed,
  onModeChange,
  onDensityChange,
  onEmergencyTrigger,
  onPauseToggle,
  onReset,
  onSpeedChange,
}: DensityControlPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/82 p-5 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Density Controls
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">Traffic Inputs</h2>

      <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/45 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Demo Controls
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Pause timers, reset the run, or speed up the simulation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPauseToggle}
              className={`rounded-md border px-3 py-2 text-sm font-black transition ${
                isPaused
                  ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100"
                  : "border-amber-300/35 bg-amber-300/15 text-amber-100"
              }`}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-slate-300/25 bg-slate-300/10 px-3 py-2 text-sm font-black text-slate-100 transition hover:border-slate-100/40 hover:bg-slate-200/15"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {([1, 1.5, 2] as SimulationSpeed[]).map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => onSpeedChange(speed)}
              className={`rounded-md border px-3 py-2 text-sm font-black transition ${
                simulationSpeed === speed
                  ? "border-teal-200/60 bg-teal-300 text-slate-950 shadow-glow"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-1.5">
        <button
          type="button"
          disabled={emergencyActive}
          onClick={() => onModeChange("fixed")}
          className={`rounded-md px-3 py-2 text-sm font-bold transition ${
            mode === "fixed"
              ? "bg-sky-300 text-slate-950 shadow-glow"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Fixed-Time
        </button>
        <button
          type="button"
          disabled={emergencyActive}
          onClick={() => onModeChange("adaptive")}
          className={`rounded-md px-3 py-2 text-sm font-bold transition ${
            mode === "adaptive"
              ? "bg-teal-300 text-slate-950 shadow-glow"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Adaptive
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-red-300/25 bg-red-500/10 p-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">
              Emergency Priority
            </p>
            <p className="mt-1 text-sm leading-5 text-red-50/80">
              Trigger an approaching emergency vehicle from any lane.
            </p>
          </div>
          <span
            className={`w-fit rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
              emergencyActive
                ? "border-red-200/40 bg-red-200/20 text-red-50"
                : "border-slate-400/20 bg-slate-400/10 text-slate-300"
            }`}
          >
            {emergencyActive ? "Override Active" : "Ready"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {lanes.map((lane) => (
            <button
              key={`emergency-${lane}`}
              type="button"
              disabled={emergencyActive}
              onClick={() => onEmergencyTrigger(lane)}
              className="min-h-11 rounded-md border border-red-300/25 bg-red-400/12 px-3 py-2 text-sm font-black text-red-50 transition hover:border-red-200/55 hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Trigger Emergency: {lane}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {lanes.map((lane) => (
          <label
            key={lane}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-200">
                {lane} density
              </span>
              <input
                className="w-16 rounded-md border border-white/10 bg-slate-950 px-2 py-1 text-right text-sm font-bold text-white outline-none transition focus:border-teal-300"
                min={1}
                max={50}
                type="number"
                value={densities[lane]}
                onChange={(event) =>
                  onDensityChange(lane, Number(event.target.value))
                }
              />
            </div>
            <input
              className="mt-3 h-2 w-full cursor-pointer accent-teal-300"
              min={1}
              max={50}
              type="range"
              value={densities[lane]}
              onChange={(event) =>
                onDensityChange(lane, Number(event.target.value))
              }
            />
            <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>1</span>
              <span>{densities[lane]} vehicles</span>
              <span>50</span>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

export default DensityControlPanel;
