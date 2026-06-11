import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

const issues = [
  { level: "bad", title: "Hero headline doesn't say what you do", impact: "High impact" },
  { level: "bad", title: "No social proof above the fold", impact: "High impact" },
  { level: "warn", title: "Pricing requires 3 clicks to find", impact: "Medium impact" },
  { level: "warn", title: "Page weight 4.8 MB — hurts mobile LCP", impact: "Medium impact" },
  { level: "warn", title: "Meta description missing on 6 pages", impact: "SEO" },
];

const levelColor = (l: string) =>
  l === "bad" ? colors.bad : l === "warn" ? colors.warn : colors.good;

export const Issues: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 100 }}>
      <div style={{ width: 1300, maxWidth: "92%" }}>
        <div
          style={{
            fontFamily: body,
            color: colors.accent,
            fontSize: 22,
            letterSpacing: 5,
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 14,
            opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          What's blocking conversions
        </div>
        <h2
          style={{
            fontFamily: heading,
            fontSize: 76,
            fontWeight: 700,
            color: colors.text,
            margin: "0 0 44px 0",
            letterSpacing: -2.5,
            opacity: interpolate(frame, [6, 20], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(spring({ frame: frame - 6, fps, config: { damping: 18 } }), [0, 1], [40, 0])}px)`,
          }}
        >
          Specific fixes, ranked by impact.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {issues.map((it, i) => {
            const start = 16 + i * 10;
            const o = interpolate(frame, [start, start + 14], [0, 1], { extrapolateRight: "clamp" });
            const x = interpolate(spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 140 } }), [0, 1], [60, 0]);
            return (
              <div
                key={i}
                style={{
                  opacity: o,
                  transform: `translateX(${x}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "22px 28px",
                  borderRadius: 18,
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: levelColor(it.level),
                    boxShadow: `0 0 14px ${levelColor(it.level)}`,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontFamily: heading,
                    fontSize: 28,
                    fontWeight: 500,
                    color: colors.textDim,
                    minWidth: 60,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontFamily: body,
                    fontSize: 32,
                    color: colors.text,
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {it.title}
                </div>
                <div
                  style={{
                    fontFamily: body,
                    fontSize: 18,
                    fontWeight: 600,
                    color: levelColor(it.level),
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: `${levelColor(it.level)}22`,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {it.impact}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};