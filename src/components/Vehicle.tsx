import { motion } from "framer-motion";
import type { Lane } from "../types";

type VehicleProps = {
  lane: Lane;
  canMove: boolean;
  color: string;
  type: "car" | "bus" | "van";
  gapPx: number;
  delay?: number;
};

const paths: Record<
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
    className: "left-[56%] top-[28%]",
    start: { x: "-50%", y: "-620%" },
    wait: { x: "-50%", y: "-50%" },
    end: { x: "-50%", y: "980%" },
    rotate: 180,
  },
  South: {
    className: "left-[44%] top-[72%]",
    start: { x: "-50%", y: "520%" },
    wait: { x: "-50%", y: "-50%" },
    end: { x: "-50%", y: "-1080%" },
    rotate: 0,
  },
  East: {
    className: "left-[72%] top-[56%]",
    start: { x: "520%", y: "-50%" },
    wait: { x: "-50%", y: "-50%" },
    end: { x: "-1160%", y: "-50%" },
    rotate: -90,
  },
  West: {
    className: "left-[28%] top-[44%]",
    start: { x: "-620%", y: "-50%" },
    wait: { x: "-50%", y: "-50%" },
    end: { x: "1060%", y: "-50%" },
    rotate: 90,
  },
};

const typeSize = {
  car: "h-9 w-5",
  van: "h-10 w-6",
  bus: "h-12 w-6",
};

// gapPx is the cumulative real length of every vehicle ahead in the queue
// (computed in Intersection.tsx), so spacing always reflects actual vehicle
// sizes instead of a flat per-slot offset.
const getQueuedWait = (
  lane: Lane,
  wait: { x: string; y: string },
  gapPx: number,
) => {
  if (lane === "North") return { x: wait.x, y: `calc(${wait.y} - ${gapPx}px)` };
  if (lane === "South") return { x: wait.x, y: `calc(${wait.y} + ${gapPx}px)` };
  if (lane === "East") return { x: `calc(${wait.x} + ${gapPx}px)`, y: wait.y };
  return { x: `calc(${wait.x} - ${gapPx}px)`, y: wait.y };
};

function Vehicle({
  lane,
  canMove,
  color,
  type,
  gapPx,
  delay = 0,
}: VehicleProps) {
  const path = paths[lane];
  const wait = getQueuedWait(lane, path.wait, gapPx);

  return (
    <motion.div
      className={`absolute z-20 ${typeSize[type]} ${path.className}`}
      style={{
        rotate: path.rotate,
      }}
      initial={path.start}
      animate={
        canMove
          ? {
              // 5 keyframes to match the 5 "times" entries below — the
              // previous version had only 4 x/y keyframes against 5 "times",
              // which desynced position from the fade and caused a visible
              // snap/stutter on every loop.
              x: [wait.x, path.end.x, path.start.x, wait.x, wait.x],
              y: [wait.y, path.end.y, path.start.y, wait.y, wait.y],
              opacity: [1, 1, 0, 0, 1],
            }
          : {
              x: wait.x,
              y: wait.y,
              opacity: 1,
            }
      }
      transition={{
        duration: 5.2,
        repeat: canMove ? Infinity : 0,
        ease: "linear",
        delay,
        times: canMove ? [0, 0.56, 0.57, 0.92, 1] : undefined,
      }}
    >
      <div
        className={`relative h-full w-full rounded-md border border-white/45 ${color}`}
        style={{ boxShadow: "0 12px 24px rgba(0, 0, 0, 0.48)" }}
      >
        <span className="absolute left-1/2 top-1 h-[22%] w-[58%] -translate-x-1/2 rounded-sm bg-white/70" />
        <span className="absolute bottom-1 left-1/2 h-[18%] w-[58%] -translate-x-1/2 rounded-sm bg-slate-950/45" />
        <span className="absolute -left-0.5 top-1.5 h-2 w-0.5 rounded bg-slate-950" />
        <span className="absolute -right-0.5 top-1.5 h-2 w-0.5 rounded bg-slate-950" />
        <span className="absolute -left-0.5 bottom-1.5 h-2 w-0.5 rounded bg-slate-950" />
        <span className="absolute -right-0.5 bottom-1.5 h-2 w-0.5 rounded bg-slate-950" />
        <span className="absolute left-1/2 -top-0.5 h-1 w-2 -translate-x-1/2 rounded-full bg-yellow-100/90" />
      </div>
    </motion.div>
  );
}

export default Vehicle;