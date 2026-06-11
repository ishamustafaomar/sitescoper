import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

const Card: React.FC<{
  label: string;
  color: string;
  score: number;
  copy: string;
  delay: number;
  side: "left" | "right";
}> = ({ label, color, score, copy, delay, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 130 } });
  const x = interpolate(sp, [0, 1], [side === "left" ? -120 : 120, 0]);
  const o = interpolate(frame, [delay, delay + 16], [0, 1], { extrapolateRight: "clamp" });
  const scoreShown = Math.round(interpolate(frame, [delay + 10, delay + 50], [0, score], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <div
      style={{
        flex: 1,
        opacity: o,
        transform: `translateX(${x}px)`,
        padding: 48,
        borderRadius: 28,
        background: colors.surface,
        border: `2px solid ${color}55`,
        boxShadow: `0 30px 80px -30px ${color}66`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "8px 18px",
          borderRadius: 999,
          background: `${color}22`,
          color,
          fontFamily: body,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 28,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: heading,
          fontSize: 220,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: -10,
          color,
          fontVariantNumeric: "tabular-nums",
          marginBottom: 16,
        }}
      >
        {scoreShown}
      </div>
      <div
        style={{
          fontFamily: body,
          fontSize: 26,
          color: colors.textMuted,
          lineHeight: 1.4,
        }}
      >
        {copy}
      </div>
    </div>
  );
};

export const BeforeAfter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrowS = spring({ frame: frame - 40, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div
        style={{
          fontFamily: body,
          color: colors.accent,
          fontSize: 22,
          letterSpacing: 5,
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: 12,
          opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Before vs after one scope
      </div>
      <h2
        style={{
          fontFamily: heading,
          fontSize: 76,
          fontWeight: 700,
          color: colors.text,
          letterSpacing: -2.5,
          margin: "0 0 56px 0",
          opacity: interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        One audit. <span style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>Real lift.</span>
      </h2>

      <div style={{ display: "flex", gap: 56, width: 1500, alignItems: "stretch", position: "relative" }}>
        <Card label="Before" color={colors.bad} score={48} copy="Vague hero, slow LCP, no proof." delay={12} side="left" />
        <Card label="After" color={colors.good} score={87} copy="Sharp copy, fast load, trust above fold." delay={32} side="right" />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${0.4 + arrowS * 0.6}) rotate(${interpolate(arrowS, [0, 1], [-20, 0])}deg)`,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: colors.bg,
            border: `3px solid ${colors.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            color: colors.accent,
            fontFamily: heading,
            fontWeight: 700,
            boxShadow: `0 0 40px ${colors.accent}aa`,
          }}
        >
          →
        </div>
      </div>
    </AbsoluteFill>
  );
};