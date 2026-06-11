import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

const steps = [
  "Crawling pages",
  "Capturing screenshots",
  "Extracting content",
  "Analyzing UX & SEO",
];

export const Scanning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ringO = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const ringS = spring({ frame, fps, config: { damping: 18 } });

  const rotate = (frame * 6) % 360;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ display: "flex", gap: 100, alignItems: "center" }}>
        {/* Radar */}
        <div
          style={{
            position: "relative",
            width: 460,
            height: 460,
            opacity: ringO,
            transform: `scale(${0.85 + ringS * 0.15})`,
          }}
        >
          {/* Pulsing rings */}
          {[0, 1, 2].map((i) => {
            const pulse = ((frame + i * 25) % 75) / 75;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `2px solid ${colors.primary}`,
                  transform: `scale(${0.3 + pulse * 0.7})`,
                  opacity: 1 - pulse,
                }}
              />
            );
          })}
          {/* Static rings */}
          {[0.4, 0.65, 0.9].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `1px solid ${colors.border}`,
                transform: `scale(${s})`,
              }}
            />
          ))}
          {/* Sweeping cone */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `conic-gradient(from ${rotate}deg, transparent 0deg, ${colors.accent}88 60deg, transparent 120deg)`,
              mask: "radial-gradient(circle, black 0, black 100%)",
            }}
          />
          {/* Core */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 100,
              height: 100,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              boxShadow: `0 0 60px ${colors.primary}aa`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: heading,
              fontSize: 56,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            ✦
          </div>
          {/* Detected dots */}
          {[
            [0.2, 0.3],
            [0.7, 0.25],
            [0.8, 0.65],
            [0.25, 0.75],
            [0.55, 0.85],
          ].map(([x, y], i) => {
            const appear = interpolate(frame, [20 + i * 8, 30 + i * 8], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${x * 100}%`,
                  top: `${y * 100}%`,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: colors.accent,
                  boxShadow: `0 0 14px ${colors.accent}`,
                  transform: `translate(-50%, -50%) scale(${appear})`,
                }}
              />
            );
          })}
        </div>

        {/* Step list */}
        <div style={{ width: 540 }}>
          <div
            style={{
              fontFamily: body,
              color: colors.accent,
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 16,
              opacity: interpolate(frame, [4, 16], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            Deep scan in progress
          </div>
          <h2
            style={{
              fontFamily: heading,
              fontSize: 64,
              fontWeight: 700,
              color: colors.text,
              margin: "0 0 32px 0",
              letterSpacing: -2,
              opacity: interpolate(frame, [8, 22], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            Reading your site<br />
            like a real visitor.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((s, i) => {
              const start = 20 + i * 12;
              const o = interpolate(frame, [start, start + 14], [0, 1], { extrapolateRight: "clamp" });
              const x = interpolate(spring({ frame: frame - start, fps, config: { damping: 18 } }), [0, 1], [-30, 0]);
              const isActive = frame > start && frame < start + 36;
              return (
                <div
                  key={s}
                  style={{
                    opacity: o,
                    transform: `translateX(${x}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "16px 22px",
                    borderRadius: 14,
                    background: isActive ? `${colors.primary}22` : "transparent",
                    border: `1px solid ${isActive ? colors.primary : colors.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: frame > start + 30 ? colors.good : isActive ? colors.primary : colors.surfaceHi,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 16,
                      fontFamily: heading,
                      fontWeight: 700,
                    }}
                  >
                    {frame > start + 30 ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      fontFamily: body,
                      fontSize: 26,
                      color: colors.text,
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};