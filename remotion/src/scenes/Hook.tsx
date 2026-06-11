import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowY = interpolate(spring({ frame: frame - 2, fps, config: { damping: 18 } }), [0, 1], [30, 0]);
  const eyebrowO = interpolate(frame, [2, 14], [0, 1], { extrapolateRight: "clamp" });

  const words = ["Your", "website", "is", "leaking", "money."];
  const lastWordStart = 8 + (words.length - 1) * 6;

  const slashX = interpolate(spring({ frame: frame - lastWordStart - 6, fps, config: { damping: 22, stiffness: 140 } }), [0, 1], [-100, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div style={{ maxWidth: 1500, width: "100%" }}>
        <div
          style={{
            fontFamily: body,
            color: colors.accent,
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 600,
            transform: `translateY(${eyebrowY}px)`,
            opacity: eyebrowO,
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ width: 48, height: 2, background: colors.accent }} />
          SiteScoper · AI website auditor
        </div>

        <h1
          style={{
            fontFamily: heading,
            fontWeight: 700,
            fontSize: 168,
            lineHeight: 1.02,
            color: colors.text,
            letterSpacing: -4,
            margin: 0,
          }}
        >
          {words.map((w, i) => {
            const start = 8 + i * 6;
            const y = interpolate(spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 160 } }), [0, 1], [60, 0]);
            const o = interpolate(frame, [start, start + 10], [0, 1], { extrapolateRight: "clamp" });
            const isLast = i === words.length - 1;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `translateY(${y}px)`,
                  opacity: o,
                  marginRight: 28,
                  position: "relative",
                  background: isLast
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`
                    : "none",
                  WebkitBackgroundClip: isLast ? "text" : "border-box",
                  WebkitTextFillColor: isLast ? "transparent" : colors.text,
                }}
              >
                {w}
                {isLast && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: "55%",
                      height: 8,
                      background: colors.bad,
                      borderRadius: 4,
                      transform: `scaleX(${Math.max(0, Math.min(1, (frame - lastWordStart - 6) / 14))})`,
                      transformOrigin: "left",
                      opacity: 0.85,
                    }}
                  />
                )}
              </span>
            );
          })}
        </h1>
      </div>
    </AbsoluteFill>
  );
};