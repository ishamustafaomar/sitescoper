import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame / 998) * 100;
  return (
    <AbsoluteFill style={{ background: colors.bg, overflow: "hidden" }}>
      {/* radial glow that drifts */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(800px 600px at ${20 + drift * 0.3}% ${30 + Math.sin(frame / 60) * 10}%, ${colors.primary}22, transparent 60%), radial-gradient(700px 500px at ${80 - drift * 0.2}% ${70 + Math.cos(frame / 70) * 10}%, ${colors.accent}1a, transparent 60%)`,
        }}
      />
      {/* grid */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.08 }}
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke={colors.primaryGlow} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* drifting particles */}
      {Array.from({ length: 24 }).map((_, i) => {
        const seed = i * 137.5;
        const x = (seed % 1920);
        const y = ((seed * 1.7) % 1080 + frame * 0.4 * (1 + (i % 3) * 0.3)) % 1080;
        const size = 2 + (i % 4);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 3 === 0 ? colors.accent : colors.primaryGlow,
              opacity: 0.5,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};