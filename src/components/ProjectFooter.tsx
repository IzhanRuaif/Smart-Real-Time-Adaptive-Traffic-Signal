const concepts = [
  "Periodic scheduling",
  "Adaptive scheduling",
  "Priority scheduling",
  "Fairness / starvation avoidance",
  "Safe state transition",
  "Runtime monitoring",
  "Event traceability",
];

function ProjectFooter() {
  return (
    <footer className="rounded-lg border border-white/10 bg-slate-900/82 p-5 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Project
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">
        Smart Real-Time Adaptive Traffic Signal System with Emergency Vehicle
        Priority
      </h2>
      <p className="mt-4 text-sm font-semibold text-slate-300">
        Real-Time System Concepts
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <span
            key={concept}
            className="rounded-md border border-teal-300/20 bg-teal-300/10 px-2.5 py-1 text-xs font-bold text-teal-100"
          >
            {concept}
          </span>
        ))}
      </div>
    </footer>
  );
}

export default ProjectFooter;
