function SystemExplanation() {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/82 p-5 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Real-Time Systems View
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">
        Adaptive Scheduling and Overrides
      </h2>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
        <p>
          Fixed-Time Mode demonstrates periodic scheduling with deterministic
          North, East, South, and West phases.
        </p>
        <p>
          Adaptive Density Mode uses live sensor-like vehicle density to choose
          a lane and assign green duration dynamically.
        </p>
        <p>
          Fairness scheduling tracks waiting cycles so similar lanes are not
          starved by repeated high-density selections.
        </p>
        <p>
          Emergency priority behaves like a hard real-time requirement: the
          controller must react quickly and safely.
        </p>
        <p>
          Before emergency green, the controller enters a safe transition:
          current green to YELLOW, then all-red clearance, then emergency green.
        </p>
        <p>
          Normal adaptive traffic is soft real-time because small timing delays
          are acceptable; emergency vehicle priority is treated as hard
          real-time because missed response time is critical.
        </p>
        <p>
          The event log provides traceability for mode changes, signal phases,
          adaptive decisions, fairness events, and emergency overrides.
        </p>
        <p>
          Runtime metrics show monitoring data such as elapsed simulation time,
          completed phases, emergency count, waiting cycles, and current
          decision type.
        </p>
      </div>
    </section>
  );
}

export default SystemExplanation;
