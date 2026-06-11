import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowO = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const titleS = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 130 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 100 }}>
      <div style={{ textAlign: "center", maxWidth: 1600 }}>
        <div
          style={{
            fontFamily: body,
            color: colors.accent,
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: eyebrowO,
            marginBottom: 32,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ width: 40, height: 2, background: colors.accent }} />
          47-second audit · No credit card
          <span style={{ width: 40, height: 2, background: colors.accent }} />
        </div>

        <h1
          style={{
            fontFamily: heading,
            fontSize: 200,
            fontWeight: 700,
            color: colors.text,
            margin: 0,
            lineHeight: 0.95,
            letterSpacing: -8,
            opacity: interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${0.85 + titleS * 0.15})`,
          }}
        >
          Stop guessing.<br />
          <span
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Start scoping.
          </span>
        </h1>

        <div
          style={{
            marginTop: 56,
            display: "inline-flex",
            alignItems: "center",
            gap: 20,
            padding: "32px 56px",
            borderRadius: 24,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            boxShadow: `0 24px 80px -10px ${colors.primary}aa`,
            transform: `scale(${interpolate(spring({ frame: frame - 28, fps, config: { damping: 16, stiffness: 140 } }), [0, 1], [0.7, 1])})`,
            opacity: interpolate(frame, [28, 42], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <span
            style={{
              fontFamily: heading,
              fontWeight: 700,
              fontSize: 64,
              color: "#fff",
              letterSpacing: -1,
            }}
          >
            sitescoper.com
          </span>
          <span style={{ fontSize: 56, color: "#fff" }}>→</span>
        </div>

        <div
          style={{
            marginTop: 36,
            fontFamily: body,
            fontSize: 24,
            color: colors.textMuted,
            opacity: interpolate(frame, [44, 60], [0, 1], { extrapolateRight: "clamp" }),
            letterSpacing: 1,
          }}
        >
          AI website UX auditor · Instant SEO checker · Used by 2,400+ founders
        </div>
      </div>
    </AbsoluteFill>
  );
};