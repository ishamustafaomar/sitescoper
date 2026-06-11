import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

const cats = [
  { name: "Copy", score: 45 },
  { name: "Trust", score: 62 },
  { name: "UX", score: 78 },
  { name: "SEO", score: 68 },
  { name: "Design", score: 88 },
  { name: "Speed", score: 73 },
];

const barColor = (s: number) =>
  s >= 80 ? colors.good : s >= 60 ? colors.primary : colors.bad;

export const Categories: React.FC = () => {
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
          Scored across 6 dimensions
        </div>
        <h2
          style={{
            fontFamily: heading,
            fontSize: 76,
            fontWeight: 700,
            color: colors.text,
            margin: "0 0 50px 0",
            letterSpacing: -2.5,
            opacity: interpolate(frame, [6, 20], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Know <span style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>exactly</span> what to fix first.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {cats.map((c, i) => {
            const start = 18 + i * 6;
            const o = interpolate(frame, [start, start + 14], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 140 } }), [0, 1], [40, 0]);
            const bar = interpolate(frame, [start + 6, start + 32], [0, c.score / 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const displayed = Math.round(interpolate(frame, [start + 6, start + 32], [0, c.score], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
            const col = barColor(c.score);
            return (
              <div
                key={c.name}
                style={{
                  opacity: o,
                  transform: `translateY(${y}px)`,
                  padding: 32,
                  borderRadius: 22,
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
                  <div style={{ fontFamily: heading, fontSize: 32, fontWeight: 500, color: colors.text }}>{c.name}</div>
                  <div style={{ fontFamily: heading, fontSize: 56, fontWeight: 700, color: col, fontVariantNumeric: "tabular-nums" }}>{displayed}</div>
                </div>
                <div style={{ height: 12, borderRadius: 6, background: colors.bgDeep, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${bar * 100}%`,
                      background: `linear-gradient(90deg, ${col}, ${col}cc)`,
                      borderRadius: 6,
                      boxShadow: `0 0 14px ${col}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};