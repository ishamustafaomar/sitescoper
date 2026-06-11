import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading, body } from "../theme";

export const UrlPaste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelO = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const labelY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [20, 0]);

  const barScale = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 140 } });
  const barO = interpolate(frame, [4, 16], [0, 1], { extrapolateRight: "clamp" });

  const url = "https://your-startup.com";
  const typeStart = 22;
  const charsShown = Math.max(0, Math.min(url.length, Math.floor((frame - typeStart) * 0.9)));
  const typed = url.slice(0, charsShown);

  const btnPress = spring({ frame: frame - 60, fps, config: { damping: 12, stiffness: 200 } });
  const btnScale = 1 - btnPress * 0.06;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div style={{ width: 1200, maxWidth: "90%" }}>
        <div
          style={{
            fontFamily: body,
            color: colors.textMuted,
            fontSize: 26,
            opacity: labelO,
            transform: `translateY(${labelY}px)`,
            marginBottom: 28,
            letterSpacing: 1,
          }}
        >
          Step 1 — paste any URL.
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            transform: `scale(${0.94 + barScale * 0.06})`,
            opacity: barO,
            transformOrigin: "left center",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 110,
              borderRadius: 22,
              background: colors.surface,
              border: `2px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 36px",
              gap: 20,
              boxShadow: `0 20px 60px -20px ${colors.primary}55`,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: colors.accent,
                boxShadow: `0 0 14px ${colors.accent}`,
              }}
            />
            <span
              style={{
                fontFamily: body,
                fontSize: 42,
                color: colors.text,
                fontWeight: 500,
                letterSpacing: -0.5,
              }}
            >
              {typed}
              {frame > typeStart && frame < 90 && Math.floor(frame / 8) % 2 === 0 && (
                <span style={{ color: colors.accent, marginLeft: 2 }}>|</span>
              )}
            </span>
          </div>
          <div
            style={{
              width: 280,
              height: 110,
              borderRadius: 22,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: heading,
              fontWeight: 700,
              fontSize: 32,
              color: "#fff",
              transform: `scale(${btnScale})`,
              boxShadow: `0 14px 50px -10px ${colors.primary}cc`,
            }}
          >
            Audit →
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};