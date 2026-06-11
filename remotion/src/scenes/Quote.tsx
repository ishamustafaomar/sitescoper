import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

export const Quote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const markS = spring({ frame, fps, config: { damping: 12, stiffness: 110 } });
  const lineO = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" });

  // Word-by-word reveal
  const words = "Found 11 things I would have never spotted. Fixed three — conversions jumped 23%.".split(" ");

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 140 }}>
      <div style={{ maxWidth: 1500, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -40,
            fontFamily: heading,
            fontSize: 360,
            fontWeight: 700,
            lineHeight: 1,
            color: colors.primary,
            opacity: 0.18,
            transform: `scale(${0.6 + markS * 0.4})`,
            transformOrigin: "left top",
          }}
        >
          “
        </div>

        <p
          style={{
            fontFamily: heading,
            fontSize: 88,
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: -2,
            color: colors.text,
            margin: 0,
            position: "relative",
          }}
        >
          {words.map((w, i) => {
            const start = 14 + i * 4;
            const o = interpolate(frame, [start, start + 10], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(spring({ frame: frame - start, fps, config: { damping: 22, stiffness: 180 } }), [0, 1], [24, 0]);
            const isAccent = /23%|never/i.test(w);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: o,
                  transform: `translateY(${y}px)`,
                  marginRight: 18,
                  background: isAccent
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`
                    : "none",
                  WebkitBackgroundClip: isAccent ? "text" : "border-box",
                  WebkitTextFillColor: isAccent ? "transparent" : colors.text,
                  fontWeight: isAccent ? 700 : 500,
                }}
              >
                {w}
              </span>
            );
          })}
        </p>

        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: lineO,
          }}
        >
          <div style={{ width: 60, height: 2, background: colors.accent }} />
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: heading,
              fontWeight: 700,
              fontSize: 28,
              color: "#fff",
            }}
          >
            MR
          </div>
          <div>
            <div style={{ fontFamily: heading, fontSize: 24, color: colors.text, fontWeight: 600 }}>
              Maya R.
            </div>
            <div style={{ fontFamily: body, fontSize: 18, color: colors.textMuted, letterSpacing: 1 }}>
              Founder · Indie SaaS
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};