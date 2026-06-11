import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, heading } from "../theme";

export const Flash: React.FC<{ word: string; tint?: string }> = ({ word, tint }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = tint ?? colors.accent;

  const sp = spring({ frame, fps, config: { damping: 10, stiffness: 240 } });
  const scale = interpolate(sp, [0, 1], [0.5, 1]);
  const flashO = interpolate(frame, [0, 2, 8], [0, 1, 0], { extrapolateRight: "clamp" });
  const shake = Math.sin(frame * 1.6) * Math.max(0, 1 - frame / 12) * 6;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: colors.bgDeep }}>
      {/* white flash */}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flashO }} />
      {/* big diagonal bar */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${interpolate(frame, [0, 30], [-30, -20])}deg, transparent 35%, ${accent}28 50%, transparent 65%)`,
        }}
      />
      {/* scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, ${colors.text}05 0px, ${colors.text}05 2px, transparent 2px, transparent 6px)`,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "relative",
          transform: `scale(${scale}) translate(${shake}px, ${-shake}px)`,
        }}
      >
        <div
          style={{
            fontFamily: heading,
            fontWeight: 700,
            fontSize: 340,
            letterSpacing: -16,
            lineHeight: 0.9,
            color: colors.text,
            textShadow: `8px 0 0 ${accent}cc, -8px 0 0 ${colors.bad}aa`,
          }}
        >
          {word}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          fontFamily: heading,
          fontSize: 28,
          color: accent,
          letterSpacing: 8,
          fontWeight: 600,
          opacity: interpolate(frame, [4, 14], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {String(Math.min(99, Math.floor(frame * 3))).padStart(2, "0")} ●
      </div>
    </AbsoluteFill>
  );
};