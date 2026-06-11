import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

export const ScoreReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const score = Math.round(interpolate(frame, [10, 50], [0, 72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const ringS = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });

  const r = 200;
  const C = 2 * Math.PI * r;
  const progress = score / 100;
  const dashOffset = C * (1 - progress);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ display: "flex", gap: 120, alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            width: 480,
            height: 480,
            transform: `scale(${0.6 + ringS * 0.4})`,
          }}
        >
          <svg width="480" height="480" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="240" cy="240" r={r} stroke={colors.border} strokeWidth="22" fill="none" />
            <circle
              cx="240"
              cy="240"
              r={r}
              stroke="url(#scoreGrad)"
              strokeWidth="22"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={dashOffset}
              style={{ filter: `drop-shadow(0 0 18px ${colors.primary})` }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={colors.primary} />
                <stop offset="100%" stopColor={colors.accent} />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: heading,
                fontSize: 200,
                fontWeight: 700,
                color: colors.text,
                lineHeight: 1,
                letterSpacing: -8,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontFamily: body,
                fontSize: 26,
                color: colors.textMuted,
                marginTop: 8,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              out of 100
            </div>
          </div>
        </div>

        <div style={{ width: 600 }}>
          <div
            style={{
              fontFamily: body,
              color: colors.accent,
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 20,
              opacity: interpolate(frame, [40, 56], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            ✦ AI Verdict
          </div>
          <h2
            style={{
              fontFamily: heading,
              fontSize: 84,
              fontWeight: 700,
              color: colors.text,
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: -3,
              opacity: interpolate(frame, [48, 66], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(spring({ frame: frame - 48, fps, config: { damping: 18 } }), [0, 1], [40, 0])}px)`,
            }}
          >
            Solid foundation.<br />
            <span style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Weak hero copy.
            </span>
          </h2>
        </div>
      </div>
    </AbsoluteFill>
  );
};