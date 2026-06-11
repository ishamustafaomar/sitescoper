import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";
import { colors, heading, body } from "../theme";

const stats = [
  { n: "94%", label: "judge sites in 50ms" },
  { n: "38%", label: "leave on bad design" },
  { n: "1s", label: "delay = -7% conversions" },
];

export const Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div
        style={{
          fontFamily: body,
          color: colors.accent,
          fontSize: 24,
          letterSpacing: 6,
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: 36,
          opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        The cold, hard numbers
      </div>

      <div style={{ display: "flex", gap: 64, alignItems: "stretch" }}>
        {stats.map((s, i) => {
          const start = 8 + i * 14;
          const sp = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 130 } });
          const o = interpolate(frame, [start, start + 16], [0, 1], { extrapolateRight: "clamp" });
          const y = interpolate(sp, [0, 1], [80, 0]);
          const scale = interpolate(sp, [0, 1], [0.7, 1]);
          return (
            <div
              key={i}
              style={{
                opacity: o,
                transform: `translateY(${y}px) scale(${scale})`,
                padding: "48px 56px",
                borderRadius: 28,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                minWidth: 420,
                textAlign: "center",
                boxShadow: `0 30px 80px -30px ${colors.primary}88`,
              }}
            >
              <div
                style={{
                  fontFamily: heading,
                  fontSize: 200,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: -8,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 20,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontFamily: body,
                  fontSize: 24,
                  color: colors.textMuted,
                  letterSpacing: 1,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <Sequence from={70}>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: heading,
            fontSize: 48,
            fontWeight: 500,
            color: colors.text,
            letterSpacing: -1,
            opacity: interpolate(frame, [70, 92], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [70, 92], [20, 0], { extrapolateRight: "clamp" })}px)`,
          }}
        >
          You don't have time to <span style={{ color: colors.bad, fontWeight: 700 }}>guess</span>.
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};