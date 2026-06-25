export type Lane = "North" | "East" | "South" | "West";

export type SignalColor = "red" | "yellow" | "green";

export type SystemMode = "fixed" | "adaptive";

export type EmergencyPhase = "idle" | "transition" | "clearance" | "granted";

export type SimulationSpeed = 1 | 1.5 | 2;

export type LaneDensity = Record<Lane, number>;

export type LaneWaitingCycles = Record<Lane, number>;

export type DecisionKind = "density" | "fairness" | "similarity";

export type EventCategory =
  | "MODE"
  | "SIGNAL"
  | "ADAPTIVE"
  | "FAIRNESS"
  | "EMERGENCY"
  | "SYSTEM";

export type EmergencyOverride = {
  phase: EmergencyPhase;
  lane: Lane | null;
  transitionLane: Lane | null;
  countdown: number;
  phaseDuration: number;
};

export type EventLogEntry = {
  id: number;
  timestamp: string;
  category: EventCategory;
  message: string;
};

export type CycleStep = {
  lane: Lane;
  color: SignalColor;
  duration: number;
};

export type SignalState = Record<Lane, SignalColor>;
