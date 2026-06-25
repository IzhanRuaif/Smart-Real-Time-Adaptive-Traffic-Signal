import { motion } from "framer-motion";
import type { SignalColor } from "../types";

type TrafficLightProps = {
  activeColor: SignalColor;
  direction?: "vertical" | "horizontal";
  label: string;
};

const colors: SignalColor[] = ["red", "yellow", "green"];

// Full glow + halo for each active signal
const activeMeta: Record<
  SignalColor,
  { outer: string; inner: string; halo: string; ring: string }
> = {
  red: {
    outer: "#ef4444",
    inner: "#fca5a5",
    halo: "rgba(239,68,68,0.55)",
    ring: "rgba(252,165,165,0.5)",
  },
  yellow: {
    outer: "#eab308",
    inner: "#fef08a",
    halo: "rgba(234,179,8,0.55)",
    ring: "rgba(254,240,138,0.5)",
  },
  green: {
    outer: "#22c55e",
    inner: "#86efac",
    halo: "rgba(34,197,94,0.55)",
    ring: "rgba(134,239,172,0.5)",
  },
};

const inactiveBg: Record<SignalColor, string> = {
  red: "#3f0f0f",
  yellow: "#3a2e00",
  green: "#052e16",
};

function TrafficLight({
  activeColor,
  direction = "vertical",
  label,
}: TrafficLightProps) {
  const isVertical = direction === "vertical";

  return (
    <div
      className={`relative flex ${isVertical ? "flex-col" : "flex-row"}`}
      aria-label={`${label} signal is ${activeColor}`}
      style={{ gap: "3px" }}
    >
      {/* Housing */}
      <div
        className={`relative flex ${isVertical ? "flex-col" : "flex-row"} rounded-lg p-1.5`}
        style={{
          gap: "3px",
          background:
            "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111111 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.6), 2px 4px 12px rgba(0,0,0,0.7), -1px -1px 0 rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Housing top ridge */}
        <span
          className="absolute left-0 top-0 w-full rounded-t-lg"
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          }}
        />

        {/* Mounting bracket */}
        <span
          className={`absolute ${
            isVertical
              ? "left-1/2 -translate-x-1/2 -top-4 w-2 h-4"
              : "top-1/2 -translate-y-1/2 -left-4 h-2 w-4"
          } rounded-sm`}
          style={{
            background:
              "linear-gradient(180deg, #444 0%, #222 100%)",
            boxShadow: "1px 1px 3px rgba(0,0,0,0.6)",
          }}
        />

        {colors.map((color) => {
          const isActive = color === activeColor;
          const meta = activeMeta[color];

          return (
            <div
              key={color}
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: "20px",
                height: "20px",
                // Recessed lens socket
                background: "radial-gradient(circle at 35% 35%, #2a2a2a, #0a0a0a)",
                boxShadow: isActive
                  ? `inset 0 1px 3px rgba(0,0,0,0.8), 0 0 14px 4px ${meta.halo}`
                  : "inset 0 2px 4px rgba(0,0,0,0.9)",
                border: `1px solid ${isActive ? meta.ring : "rgba(0,0,0,0.5)"}`,
              }}
            >
              {/* Lens bulb */}
              <motion.span
                className="absolute inset-[2px] rounded-full"
                style={{
                  background: isActive
                    ? `radial-gradient(circle at 38% 32%, ${meta.inner} 0%, ${meta.outer} 55%, rgba(0,0,0,0.4) 100%)`
                    : `radial-gradient(circle at 38% 32%, ${inactiveBg[color]}cc 0%, ${inactiveBg[color]} 100%)`,
                }}
                animate={
                  isActive
                    ? { opacity: [0.82, 1, 0.82], scale: [0.98, 1, 0.98] }
                    : { opacity: 0.4, scale: 0.92 }
                }
                transition={
                  isActive
                    ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
              />

              {/* Primary specular highlight — top-left */}
              {isActive && (
                <span
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: "18%",
                    left: "20%",
                    width: "28%",
                    height: "28%",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.75) 0%, transparent 100%)",
                    filter: "blur(0.5px)",
                  }}
                />
              )}

              {/* Secondary smaller glare dot */}
              {isActive && (
                <span
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: "48%",
                    left: "55%",
                    width: "14%",
                    height: "14%",
                    background: "rgba(255,255,255,0.45)",
                  }}
                />
              )}

              {/* Outer bloom halo ring */}
              {isActive && (
                <motion.span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow: `0 0 10px 3px ${meta.halo}`,
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Housing bottom shadow lip */}
        <span
          className="absolute bottom-0 left-0 w-full rounded-b-lg"
          style={{
            height: "3px",
            background: "rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </div>
  );
}

export default TrafficLight;