# Smart Real-Time Adaptive Traffic Signal System with Emergency Vehicle Priority

## Overview

The Smart Real-Time Adaptive Traffic Signal System with Emergency Vehicle Priority is a web-based simulation that demonstrates how real-time scheduling concepts can be applied to modern traffic management systems.

The project combines:

* Fixed-Time Traffic Signal Scheduling
* Adaptive Traffic Density-Based Scheduling
* Fairness Scheduling to Prevent Starvation
* Emergency Vehicle Priority Override
* Runtime Monitoring and Event Logging

The simulator visualizes a four-way traffic intersection where signal decisions are made dynamically based on traffic density while ensuring that emergency vehicles receive immediate priority through a safe state-transition mechanism.

---

## Features

### Fixed-Time Mode

* Traditional traffic signal scheduling.
* Signals rotate through North, East, South, and West lanes.
* Deterministic and periodic execution.
* Demonstrates periodic scheduling in real-time systems.

### Adaptive Density Mode

* Traffic signal decisions are based on lane density.
* Higher-density lanes receive longer green durations.
* Dynamic scheduling improves traffic flow efficiency.
* Vehicle density can be adjusted using interactive controls.

### Fairness Scheduling

* Prevents starvation of lower-priority lanes.
* Tracks waiting cycles for each lane.
* Allows waiting lanes to gain priority after extended delays.
* Demonstrates fairness-aware scheduling techniques.

### Emergency Vehicle Priority Override

* Emergency trigger available for all four lanes.
* Simulates ambulance/fire-truck priority.
* Safe transition process:

  1. Current green signal changes to yellow.
  2. All-red clearance phase.
  3. Emergency lane receives green signal.
* Automatically returns to the previous operating mode after emergency clearance.

### Event Logging

* Categorized runtime logs:

  * MODE
  * SIGNAL
  * ADAPTIVE
  * FAIRNESS
  * EMERGENCY
  * SYSTEM
* Timestamped simulation events.
* Provides traceability of system decisions.

### Runtime Metrics

* Simulation time tracking.
* Signal cycle count.
* Emergency override count.
* Congestion monitoring.
* Waiting-cycle statistics.
* Current scheduling decision type.

### Simulation Controls

* Pause / Resume
* Reset Simulation
* Speed Control (1x, 1.5x, 2x)

### Visual Simulation

* Animated four-way intersection.
* Traffic lights with realistic signal transitions.
* Vehicle movement based on signal state.
* Emergency vehicle animation with flashing indicators.
* Responsive dashboard interface.

---

## Real-Time System Concepts Demonstrated

### Periodic Scheduling

Used in Fixed-Time Mode where signal phases repeat at predefined intervals.

### Adaptive Scheduling

Used in Adaptive Density Mode where scheduling decisions depend on dynamic traffic conditions.

### Fairness Scheduling

Ensures that no lane waits indefinitely even when traffic density is lower.

### Priority Scheduling

Emergency vehicles receive the highest scheduling priority.

### Safe State Transition

The system follows a controlled yellow and all-red sequence before granting emergency access.

### Runtime Monitoring

System metrics and event logs provide real-time visibility into scheduler behavior.

### Event Traceability

All important scheduling actions are recorded and displayed.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite

### Styling

* Tailwind CSS

### Animation

* Framer Motion / Motion

### Language

* TypeScript

---

## Project Structure

```text
src/
│
├── components/
│   ├── Dashboard.tsx
│   ├── DensityControlPanel.tsx
│   ├── EventLogPanel.tsx
│   ├── Intersection.tsx
│   ├── LaneDensityOverview.tsx
│   ├── MetricsPanel.tsx
│   ├── ProjectFooter.tsx
│   ├── SystemExplanation.tsx
│   ├── TrafficLight.tsx
│   └── Vehicle.tsx
│
├── App.tsx
├── main.tsx
├── types.ts
└── index.css
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/RaafidAfraazG/Smart-Real-Time-Adaptive-Traffic-Signal.git
cd smart-real-time-adaptive-traffic-signal
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Production Build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

## How to Use

### Fixed-Time Simulation

1. Launch the application.
2. Keep the simulator in Fixed-Time Mode.
3. Observe periodic signal transitions and vehicle movement.

### Adaptive Density Simulation

1. Switch to Adaptive Density Mode.
2. Adjust lane densities using sliders.
3. Observe how the scheduler selects the busiest lane.
4. Watch green durations change dynamically.

### Emergency Override

1. Trigger an emergency from any lane.
2. Observe safe signal transition.
3. Watch emergency vehicle movement.
4. Observe automatic recovery to the previous mode.

### Runtime Analysis

* Monitor Event Logs.
* Track Runtime Metrics.
* Observe scheduling decisions.
* Analyze fairness behavior.

---

## Educational Objectives

This project demonstrates:

* Traffic management using real-time scheduling.
* Priority handling for critical events.
* Adaptive decision-making based on live inputs.
* Fairness mechanisms to avoid starvation.
* Monitoring and traceability in real-time systems.

It serves as an educational simulation for understanding how operating-system scheduling concepts can be applied to intelligent transportation systems.

---

## Future Enhancements

Potential future improvements include:

* AI-based vehicle detection using computer vision.
* Camera-driven traffic density estimation.
* Multiple connected intersections.
* Emergency route optimization.
* Cloud-based traffic analytics.
* IoT sensor integration.
* Machine learning-based traffic prediction.

