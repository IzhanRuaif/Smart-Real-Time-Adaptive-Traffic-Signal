import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import DensityControlPanel from "./components/DensityControlPanel";
import Dashboard from "./components/Dashboard";
import EventLogPanel from "./components/EventLogPanel";
import Intersection from "./components/Intersection";
import LaneDensityOverview from "./components/LaneDensityOverview";
import MetricsPanel from "./components/MetricsPanel";
import ProjectFooter from "./components/ProjectFooter";
import SystemExplanation from "./components/SystemExplanation";
import type {
  CycleStep,
  DecisionKind,
  EmergencyOverride,
  EventCategory,
  EventLogEntry,
  Lane,
  LaneDensity,
  LaneWaitingCycles,
  SimulationSpeed,
  SignalState,
  SystemMode,
} from "./types";

type AdaptiveDecision = {
  kind: DecisionKind;
  lane: Lane;
  reason: string;
};

const cycle: CycleStep[] = [
  { lane: "North", color: "green", duration: 8 },
  { lane: "North", color: "yellow", duration: 3 },
  { lane: "East", color: "green", duration: 8 },
  { lane: "East", color: "yellow", duration: 3 },
  { lane: "South", color: "green", duration: 8 },
  { lane: "South", color: "yellow", duration: 3 },
  { lane: "West", color: "green", duration: 8 },
  { lane: "West", color: "yellow", duration: 3 },
];

const lanes: Lane[] = ["North", "East", "South", "West"];

const initialDensities: LaneDensity = {
  North: 24,
  East: 16,
  South: 32,
  West: 12,
};

const initialWaitingCycles: LaneWaitingCycles = {
  North: 0,
  East: 0,
  South: 0,
  West: 0,
};

const initialEmergencyOverride: EmergencyOverride = {
  phase: "idle",
  lane: null,
  transitionLane: null,
  countdown: 0,
  phaseDuration: 0,
};

const EMERGENCY_TRANSITION_SECONDS = 3;
const EMERGENCY_CLEARANCE_SECONDS = 1;
const EMERGENCY_GREEN_SECONDS = 10;
const MAX_LOG_ENTRIES = 12;

const clampDensity = (value: number) => Math.min(50, Math.max(1, value));

const formatSimTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const getGreenDuration = (density: number) => {
  if (density <= 10) return 8;
  if (density <= 25) return 14;
  if (density <= 40) return 20;
  return 25;
};

const getDensityRangeLabel = (density: number) => {
  if (density <= 10) return "low";
  if (density <= 25) return "moderate";
  if (density <= 40) return "high";
  return "very high";
};

const getHighestDensityLane = (densities: LaneDensity) => {
  return lanes.reduce((highest, lane) =>
    densities[lane] > densities[highest] ? lane : highest,
  );
};

function App() {
  const initialAdaptiveLane = getHighestDensityLane(initialDensities);
  const [mode, setMode] = useState<SystemMode>("fixed");
  const [densities, setDensities] = useState<LaneDensity>(initialDensities);
  const [waitingCycles, setWaitingCycles] =
    useState<LaneWaitingCycles>(initialWaitingCycles);
  const [fixedStepIndex, setFixedStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(cycle[0].duration);
  const [simTime, setSimTime] = useState(0);
  const [lastServedLane, setLastServedLane] = useState<Lane | null>(null);
  const [decisionKind, setDecisionKind] = useState<DecisionKind>("density");
  const [adaptiveStep, setAdaptiveStep] = useState<CycleStep>({
    lane: initialAdaptiveLane,
    color: "green",
    duration: getGreenDuration(initialDensities[initialAdaptiveLane]),
  });
  const [adaptiveGreenDuration, setAdaptiveGreenDuration] = useState(
    getGreenDuration(initialDensities[initialAdaptiveLane]),
  );
  const [emergency, setEmergency] = useState<EmergencyOverride>(
    initialEmergencyOverride,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<SimulationSpeed>(1);
  const [completedPhases, setCompletedPhases] = useState(0);
  const [emergencyOverridesHandled, setEmergencyOverridesHandled] = useState(0);
  const [lastSelectedLane, setLastSelectedLane] = useState<Lane | null>(
    cycle[0].lane,
  );
  const [decisionReason, setDecisionReason] = useState(
    `${initialAdaptiveLane} selected due to highest density: ${
      initialDensities[initialAdaptiveLane]
    } vehicles.`,
  );
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([
    {
      id: 0,
      timestamp: "00:00",
      category: "SYSTEM",
      message: "System started in Fixed-Time Mode",
    },
  ]);

  const densitiesRef = useRef(densities);
  const waitingCyclesRef = useRef(waitingCycles);
  const lastServedLaneRef = useRef(lastServedLane);
  const simTimeRef = useRef(simTime);
  const modeRef = useRef(mode);
  const logIdRef = useRef(1);

  useEffect(() => { densitiesRef.current = densities; }, [densities]);
  useEffect(() => { waitingCyclesRef.current = waitingCycles; }, [waitingCycles]);
  useEffect(() => { lastServedLaneRef.current = lastServedLane; }, [lastServedLane]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { simTimeRef.current = simTime; }, [simTime]);

  const addLog = useCallback((category: EventCategory, message: string) => {
    const entry: EventLogEntry = {
      id: logIdRef.current,
      timestamp: formatSimTime(simTimeRef.current),
      category,
      message,
    };
    logIdRef.current += 1;
    setEventLog((current) => [entry, ...current].slice(0, MAX_LOG_ENTRIES));
  }, []);

  const chooseAdaptiveLane = useCallback(
    (
      currentDensities: LaneDensity,
      currentWaiting: LaneWaitingCycles,
      previousLane: Lane | null,
    ): AdaptiveDecision => {
      const highestLane = getHighestDensityLane(currentDensities);
      const highestDensity = currentDensities[highestLane];
      const fairnessCandidates = lanes
        .filter(
          (lane) =>
            lane !== previousLane &&
            currentWaiting[lane] >= 2 &&
            currentDensities[lane] >= highestDensity - 10,
        )
        .sort((left, right) => {
          const waitingDiff = currentWaiting[right] - currentWaiting[left];
          return waitingDiff || currentDensities[right] - currentDensities[left];
        });

      if (fairnessCandidates.length > 0) {
        const lane = fairnessCandidates[0];
        return {
          kind: "fairness",
          lane,
          reason: `${lane} selected due to fairness rule after waiting ${currentWaiting[lane]} cycles.`,
        };
      }

      if (highestLane === previousLane) {
        const alternateLane = lanes
          .filter((lane) => lane !== highestLane)
          .sort(
            (left, right) => currentDensities[right] - currentDensities[left],
          )[0];

        if (currentDensities[alternateLane] >= highestDensity - 5) {
          return {
            kind: "similarity",
            lane: alternateLane,
            reason: `${alternateLane} selected to avoid repeating ${highestLane}; density is close at ${currentDensities[alternateLane]} vehicles.`,
          };
        }
      }

      return {
        kind: "density",
        lane: highestLane,
        reason: `${highestLane} selected due to highest density: ${highestDensity} vehicles.`,
      };
    },
    [],
  );

  const assignAdaptiveGreen = useCallback(
    (decision: AdaptiveDecision, currentDensities: LaneDensity) => {
      const duration = getGreenDuration(currentDensities[decision.lane]);
      const range = getDensityRangeLabel(currentDensities[decision.lane]);
      const durationReason = `${decision.lane} served for ${duration} seconds based on ${range} density range.`;

      setAdaptiveGreenDuration(duration);
      setDecisionKind(decision.kind);
      setDecisionReason(`${decision.reason} ${durationReason}`);
      setAdaptiveStep({ lane: decision.lane, color: "green", duration });
      setLastServedLane(decision.lane);
      setLastSelectedLane(decision.lane);
      setWaitingCycles((current) => {
        const next = lanes.reduce((cycles, lane) => {
          cycles[lane] = lane === decision.lane ? 0 : current[lane] + 1;
          return cycles;
        }, {} as LaneWaitingCycles);
        waitingCyclesRef.current = next;
        return next;
      });

      addLog(decision.kind === "fairness" ? "FAIRNESS" : "ADAPTIVE", decision.reason);
      addLog("SIGNAL", `Green duration assigned: ${duration} seconds`);
    },
    [addLog],
  );

  const normalStep = mode === "fixed" ? cycle[fixedStepIndex] : adaptiveStep;
  const emergencyActive = emergency.phase !== "idle" && emergency.lane !== null;
  const activeStep =
    emergency.phase === "transition" && emergency.transitionLane
      ? { lane: emergency.transitionLane, color: "yellow" as const, duration: EMERGENCY_TRANSITION_SECONDS }
      : emergency.phase === "granted" && emergency.lane
        ? { lane: emergency.lane, color: "green" as const, duration: EMERGENCY_GREEN_SECONDS }
        : emergency.phase === "clearance" && emergency.lane
          ? { lane: emergency.lane, color: "red" as const, duration: EMERGENCY_CLEARANCE_SECONDS }
          : normalStep;

  const activeCountdown = emergencyActive ? emergency.countdown : countdown;
  const activePhaseDuration = emergencyActive ? emergency.phaseDuration : activeStep.duration;
  const activeGreenDuration = emergencyActive
    ? EMERGENCY_GREEN_SECONDS
    : mode === "fixed" ? 8 : adaptiveGreenDuration;

  const normalPhaseKey = `${mode}-${normalStep.lane}-${normalStep.color}-${normalStep.duration}`;
  const normalPhaseKeyRef = useRef(normalPhaseKey);

  useEffect(() => {
    if (normalPhaseKeyRef.current !== normalPhaseKey) {
      normalPhaseKeyRef.current = normalPhaseKey;
      setCountdown(normalStep.duration);
    }
  }, [normalPhaseKey, normalStep.duration]);

  useEffect(() => {
    if (isPaused) return;

    const intervalId = window.setInterval(() => {
      setSimTime((current) => {
        const next = current + 1;
        simTimeRef.current = next;
        return next;
      });

      if (emergency.phase !== "idle") {
        setEmergency((current) => {
          if (current.phase === "idle") return current;

          if (current.countdown > 1) {
            return { ...current, countdown: current.countdown - 1 };
          }

          if (current.phase === "transition") {
            setCompletedPhases((total) => total + 1);
            addLog("EMERGENCY", "All-red clearance started for emergency request.");
            return {
              ...current,
              phase: "clearance",
              transitionLane: null,
              countdown: EMERGENCY_CLEARANCE_SECONDS,
              phaseDuration: EMERGENCY_CLEARANCE_SECONDS,
            };
          }

          if (current.phase === "clearance" && current.lane) {
            setCompletedPhases((total) => total + 1);
            setLastSelectedLane(current.lane);
            addLog("EMERGENCY", `Emergency green granted to ${current.lane} lane.`);
            return {
              ...current,
              phase: "granted",
              countdown: EMERGENCY_GREEN_SECONDS,
              phaseDuration: EMERGENCY_GREEN_SECONDS,
            };
          }

          if (current.phase === "granted" && current.lane) {
            const resumedMode = modeRef.current === "fixed" ? "Fixed-Time Mode" : "Adaptive Density Mode";
            setCompletedPhases((total) => total + 1);
            setEmergencyOverridesHandled((total) => total + 1);
            addLog("EMERGENCY", `Emergency vehicle cleared from ${current.lane} lane.`);
            addLog("MODE", `Normal scheduling resumed: ${resumedMode}.`);
          }

          return { ...initialEmergencyOverride };
        });
        return;
      }

      if (mode === "adaptive" && adaptiveStep.color === "green") {
        setDensities((current) => {
          const next = lanes.reduce((updated, lane) => {
            const isActiveLane = lane === adaptiveStep.lane;
            const waitingIncrease = simTimeRef.current % 3 === 0 ? 1 : 0;
            const delta = isActiveLane ? -1 : waitingIncrease;
            updated[lane] = clampDensity(current[lane] + delta);
            return updated;
          }, {} as LaneDensity);
          densitiesRef.current = next;
          return next;
        });
      }

      setCountdown((current) => {
        if (current <= 1) {
          setCompletedPhases((total) => total + 1);

          if (mode === "fixed") {
            setFixedStepIndex((index) => {
              const nextIndex = (index + 1) % cycle.length;
              const nextStep = cycle[nextIndex];
              if (nextStep.color === "green") {
                setLastSelectedLane(nextStep.lane);
                addLog("SIGNAL", `${nextStep.lane} lane selected by fixed cycle.`);
              }
              return nextIndex;
            });
          } else if (adaptiveStep.color === "green") {
            addLog("ADAPTIVE", `${adaptiveStep.lane} density reduced during green service.`);
            addLog(
              "ADAPTIVE",
              lanes.filter((lane) => lane !== adaptiveStep.lane).join("/").concat(" density increased while waiting."),
            );
            setAdaptiveStep({ lane: adaptiveStep.lane, color: "yellow", duration: 3 });
          } else {
            const decision = chooseAdaptiveLane(
              densitiesRef.current,
              waitingCyclesRef.current,
              lastServedLaneRef.current,
            );
            assignAdaptiveGreen(decision, densitiesRef.current);
          }

          return 1;
        }

        return current - 1;
      });
    }, 1000 / simulationSpeed);

    return () => window.clearInterval(intervalId);
  }, [
    adaptiveStep, addLog, assignAdaptiveGreen, chooseAdaptiveLane,
    emergency.phase, isPaused, mode, simulationSpeed,
  ]);

  const signalState = useMemo<SignalState>(() => {
    if (emergency.phase === "clearance") {
      return lanes.reduce((state, lane) => {
        state[lane] = "red";
        return state;
      }, {} as SignalState);
    }
    return lanes.reduce((state, lane) => {
      state[lane] = lane === activeStep.lane ? activeStep.color : "red";
      return state;
    }, {} as SignalState);
  }, [activeStep, emergency.phase]);

  const highestDensityLane = useMemo(() => getHighestDensityLane(densities), [densities]);

  const handleModeChange = (nextMode: SystemMode) => {
    if (emergencyActive) return;
    if (nextMode === mode) return;

    if (nextMode === "adaptive") {
      addLog("MODE", "Mode switched to Adaptive Density Mode.");
      const decision = chooseAdaptiveLane(densitiesRef.current, waitingCyclesRef.current, lastServedLaneRef.current);
      assignAdaptiveGreen(decision, densitiesRef.current);
    } else {
      addLog("MODE", "Mode switched to Fixed-Time Mode.");
      setFixedStepIndex(0);
      setLastSelectedLane(cycle[0].lane);
    }

    setMode(nextMode);
  };

  const handleDensityChange = (lane: Lane, value: number) => {
    setDensities((current) => {
      const next = { ...current, [lane]: clampDensity(value) };
      densitiesRef.current = next;
      return next;
    });
  };

  const handleEmergencyTrigger = (lane: Lane) => {
    if (emergencyActive) return;

    addLog("EMERGENCY", `Emergency triggered from ${lane} lane.`);

    if (activeStep.color === "green" && activeStep.lane !== lane) {
      addLog("EMERGENCY", `Safe transition started: ${activeStep.lane} green changed to yellow.`);
      setEmergency({
        phase: "transition",
        lane,
        transitionLane: activeStep.lane,
        countdown: EMERGENCY_TRANSITION_SECONDS,
        phaseDuration: EMERGENCY_TRANSITION_SECONDS,
      });
      return;
    }

    if (activeStep.color === "green" && activeStep.lane === lane) {
      setLastSelectedLane(lane);
      addLog("EMERGENCY", `Emergency green granted to ${lane} lane.`);
      setEmergency({
        phase: "granted",
        lane,
        transitionLane: null,
        countdown: EMERGENCY_GREEN_SECONDS,
        phaseDuration: EMERGENCY_GREEN_SECONDS,
      });
      return;
    }

    addLog("EMERGENCY", "All-red clearance started for emergency request.");
    setEmergency({
      phase: "clearance",
      lane,
      transitionLane: null,
      countdown: EMERGENCY_CLEARANCE_SECONDS,
      phaseDuration: EMERGENCY_CLEARANCE_SECONDS,
    });
  };

  const handlePauseToggle = () => {
    setIsPaused((current) => {
      const next = !current;
      addLog("SYSTEM", next ? "Simulation paused." : "Simulation resumed.");
      return next;
    });
  };

  const handleSpeedChange = (speed: SimulationSpeed) => {
    setSimulationSpeed(speed);
    addLog("SYSTEM", `Simulation speed set to ${speed}x.`);
  };

  const handleReset = () => {
    const adaptiveLane = getHighestDensityLane(initialDensities);
    const adaptiveDuration = getGreenDuration(initialDensities[adaptiveLane]);
    const resetLog: EventLogEntry = {
      id: 0,
      timestamp: "00:00",
      category: "SYSTEM",
      message: "Simulation reset to clean starting state.",
    };

    logIdRef.current = 1;
    densitiesRef.current = initialDensities;
    waitingCyclesRef.current = initialWaitingCycles;
    lastServedLaneRef.current = null;
    simTimeRef.current = 0;
    modeRef.current = "fixed";
    normalPhaseKeyRef.current = `fixed-${cycle[0].lane}-${cycle[0].color}-${cycle[0].duration}`;

    setMode("fixed");
    setDensities(initialDensities);
    setWaitingCycles(initialWaitingCycles);
    setFixedStepIndex(0);
    setCountdown(cycle[0].duration);
    setSimTime(0);
    setLastServedLane(null);
    setDecisionKind("density");
    setAdaptiveStep({ lane: adaptiveLane, color: "green", duration: adaptiveDuration });
    setAdaptiveGreenDuration(adaptiveDuration);
    setEmergency(initialEmergencyOverride);
    setIsPaused(false);
    setSimulationSpeed(1);
    setCompletedPhases(0);
    setEmergencyOverridesHandled(0);
    setLastSelectedLane(cycle[0].lane);
    setDecisionReason(`${adaptiveLane} selected due to highest density: ${initialDensities[adaptiveLane]} vehicles.`);
    setEventLog([resetLog]);
  };

  /* ─── Status badge config ─── */
  const statusBadge = emergencyActive
    ? { dot: "signal-dot signal-dot-emergency", text: "Emergency Override Active", cls: "border-red-500/40 bg-red-500/10 text-red-300" }
    : isPaused
    ? { dot: "signal-dot bg-amber-400", text: "Simulation Paused", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300" }
    : mode === "fixed"
    ? { dot: "signal-dot signal-dot-green", text: "Fixed-Time Controller Online", cls: "border-teal-400/25 bg-teal-400/10 text-teal-200" }
    : { dot: "signal-dot signal-dot-green", text: "Adaptive Density Controller Online", cls: "border-teal-400/25 bg-teal-400/10 text-teal-200" };

  return (
    <main
      className="min-h-screen bg-grid-fade bg-[size:34px_34px] text-slate-100"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Radial ambient glow layer */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(0,180,216,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 35% at 80% 100%, rgba(255,51,51,0.06) 0%, transparent 55%)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 min-h-screen">
        <section className="mx-auto flex min-h-screen w-full max-w-[1520px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">

          {/* ── Header ── */}
          <header className="relative overflow-hidden flex flex-col justify-between gap-4 rounded-xl border px-6 py-4 md:flex-row md:items-center"
            style={{
              background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(8,21,32,0.98) 100%)",
              borderColor: "var(--border-base)",
              boxShadow: "0 1px 0 rgba(0,180,216,0.08), 0 4px 32px rgba(0,0,0,0.4)",
            }}
          >
            {/* Scan line animation */}
            <div className="scan-overlay" />

            {/* Left — title */}
            <div className="flex items-center gap-4">
              {/* Icon mark */}
              <div
                className="hidden sm:flex items-center justify-center rounded-lg w-11 h-11 flex-shrink-0"
                style={{
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
                  <circle cx="12" cy="12" r="2" />
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <div>
                <p className="eyebrow mb-1">Final Project Simulation</p>
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  Smart Real-Time Adaptive Traffic Signal System
                </h1>
              </div>
            </div>

            {/* Right — status badge */}
            <motion.div
              className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-semibold flex-shrink-0 ${statusBadge.cls}`}
              animate={{ opacity: emergencyActive ? [0.8, 1, 0.8] : 1 }}
              transition={{ duration: 1.2, repeat: emergencyActive ? Infinity : 0, ease: "easeInOut" }}
            >
              <span className={statusBadge.dot} style={{ width: 9, height: 9 }} />
              <span>{statusBadge.text}</span>
            </motion.div>
          </header>

          {/* ── Main grid ── */}
          <div className="grid flex-1 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">

            {/* Left — intersection canvas */}
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border-base)", background: "var(--bg-surface)" }}>
              <Intersection
                signals={signalState}
                densities={densities}
                emergencyLane={emergency.lane ?? undefined}
                emergencyPhase={emergency.phase}
                isPaused={isPaused}
              />
            </div>

            {/* Right — control column */}
            <div className="grid content-start gap-5 md:grid-cols-2 xl:grid-cols-1">
              <Dashboard
                mode={mode}
                activeLane={activeStep.lane}
                signalColor={activeStep.color}
                countdown={activeCountdown}
                phaseDuration={activePhaseDuration}
                greenDuration={activeGreenDuration}
                decisionKind={decisionKind}
                decisionReason={mode === "adaptive" ? decisionReason : undefined}
                emergency={emergency}
                isPaused={isPaused}
              />
              <DensityControlPanel
                mode={mode}
                densities={densities}
                emergencyActive={emergencyActive}
                isPaused={isPaused}
                simulationSpeed={simulationSpeed}
                onModeChange={handleModeChange}
                onDensityChange={handleDensityChange}
                onEmergencyTrigger={handleEmergencyTrigger}
                onPauseToggle={handlePauseToggle}
                onReset={handleReset}
                onSpeedChange={handleSpeedChange}
              />
              <MetricsPanel
                simTime={simTime}
                mode={mode}
                completedPhases={completedPhases}
                emergencyOverridesHandled={emergencyOverridesHandled}
                waitingCycles={waitingCycles}
                mostCongestedLane={highestDensityLane}
                lastSelectedLane={lastSelectedLane}
                activeLane={activeStep.lane}
                signalColor={activeStep.color}
                decisionKind={decisionKind}
                emergency={emergency}
                isPaused={isPaused}
              />
              <LaneDensityOverview
                activeLane={activeStep.lane}
                densities={densities}
                highestDensityLane={highestDensityLane}
                waitingCycles={waitingCycles}
                signals={signalState}
                fairnessLane={decisionKind === "fairness" && mode === "adaptive" ? activeStep.lane : undefined}
                emergencyLane={emergency.lane ?? undefined}
              />
              <EventLogPanel events={eventLog} />
              <SystemExplanation />
              <ProjectFooter />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;