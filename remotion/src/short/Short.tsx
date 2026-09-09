import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { c, sans, serif } from "./theme";

export const SHORT_FRAMES = 660; // 22s @ 30fps

const Caption: React.FC<{ children: React.ReactNode; delay?: number; size?: number }> = ({
  children,
  delay = 0,
  size = 96,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 170 } });
  return (
    <div
      style={{
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: -2,
        color: c.ink,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
        opacity: interpolate(frame - delay, [0, 8], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
      }}
    >
      {children}
    </div>
  );
};

const Frame: React.FC<{ children: React.ReactNode; justify?: string }> = ({
  children,
  justify = "center",
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: c.paper,
      padding: "140px 80px",
      justifyContent: justify,
      gap: 40,
    }}
  >
    {children}
  </AbsoluteFill>
);

// 0–90 — hook lands in frame 0, no intro
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Frame>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1.02,
          letterSpacing: -3,
          color: c.ink,
        }}
      >
        Your homepage
        <br />
        is losing{" "}
        <span style={{ color: c.clay }}>3 out of 4</span>
        <br />
        visitors.
      </div>
      <div
        style={{
          fontFamily: sans,
          fontSize: 46,
          fontWeight: 500,
          color: c.inkSoft,
          opacity: interpolate(frame, [10, 24], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Here's how to see exactly where.
      </div>
    </Frame>
  );
};

// 90–210 — paste URL, scan
const Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = "yourstore.com".slice(0, Math.floor(interpolate(frame, [0, 26], [0, 13], { extrapolateRight: "clamp" })));
  const pct = Math.round(interpolate(frame, [34, 105], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const steps = ["Reading your copy", "Measuring load weight", "Checking the first screen", "Scoring conversion"];
  return (
    <Frame>
      <Caption size={72}>Paste your URL.</Caption>
      <div
        style={{
          border: `4px solid ${c.ink}`,
          padding: "34px 36px",
          fontFamily: sans,
          fontSize: 54,
          fontWeight: 600,
          color: c.ink,
          background: "#fff",
        }}
      >
        {typed}
        <span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1 }}>|</span>
      </div>
      <div style={{ height: 14, background: c.paperDeep, marginTop: 20 }}>
        <div style={{ height: 14, width: `${pct}%`, background: c.clay }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 20 }}>
        {steps.map((s, i) => {
          const on = frame > 40 + i * 16;
          return (
            <div
              key={s}
              style={{
                fontFamily: sans,
                fontSize: 40,
                fontWeight: 600,
                color: on ? c.ink : c.line,
              }}
            >
              {on ? "→ " : "· "}
              {s}
            </div>
          );
        })}
      </div>
    </Frame>
  );
};

// 210–330 — score reveal
const Score: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [0, 40], [0, 41], { extrapolateRight: "clamp" }));
  return (
    <Frame>
      <Caption size={64}>It scored</Caption>
      <div
        style={{
          fontFamily: serif,
          fontSize: 420,
          lineHeight: 0.9,
          color: c.clay,
          letterSpacing: -12,
        }}
      >
        {n}
      </div>
      <div style={{ fontFamily: sans, fontSize: 52, fontWeight: 600, color: c.inkSoft }}>
        out of 100
      </div>
      <div
        style={{
          fontFamily: sans,
          fontSize: 46,
          fontWeight: 700,
          color: c.ink,
          borderTop: `4px solid ${c.ink}`,
          paddingTop: 28,
          marginTop: 24,
          opacity: interpolate(frame, [46, 60], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        And it said exactly why:
      </div>
    </Frame>
  );
};

// 330–570 — three concrete findings
const Findings: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    ["4.2 MB hero image", "Phones wait 6s before seeing anything."],
    ['Headline says "Welcome"', "Nobody learns what you sell."],
    ["Buy button below the fold", "68% never scroll far enough."],
  ];
  return (
    <Frame justify="center">
      {items.map(([title, sub], i) => {
        const start = i * 62;
        const s = spring({ frame: frame - start, fps: 30, config: { damping: 20 } });
        return (
          <div
            key={title}
            style={{
              opacity: interpolate(frame - start, [0, 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
              borderLeft: `10px solid ${c.clay}`,
              paddingLeft: 34,
              marginBottom: 56,
            }}
          >
            <div style={{ fontFamily: sans, fontSize: 68, fontWeight: 700, color: c.ink, letterSpacing: -2 }}>
              {title}
            </div>
            <div style={{ fontFamily: sans, fontSize: 42, fontWeight: 500, color: c.inkSoft, marginTop: 12 }}>
              {sub}
            </div>
          </div>
        );
      })}
    </Frame>
  );
};

// 570–660 — CTA
const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: c.ink,
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        gap: 36,
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontSize: 52,
          fontWeight: 600,
          color: c.paper,
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          textAlign: "center",
        }}
      >
        Run yours free — no account
      </div>
      <div
        style={{
          fontFamily: serif,
          fontSize: 132,
          color: c.paper,
          letterSpacing: -4,
          transform: `scale(${interpolate(
            spring({ frame: frame - 6, fps: 30, config: { damping: 18 } }),
            [0, 1],
            [0.86, 1],
          )})`,
        }}
      >
        sitescoper.com
      </div>
      <div style={{ width: 220, height: 8, background: c.clay }} />
      <div
        style={{
          fontFamily: sans,
          fontSize: 40,
          fontWeight: 600,
          color: "#bdb8ae",
          textAlign: "center",
          opacity: interpolate(frame, [24, 38], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        First audit runs in 60 seconds
      </div>
    </AbsoluteFill>
  );
};

export const Short: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: c.paper }}>
    <Sequence durationInFrames={90}>
      <Hook />
    </Sequence>
    <Sequence from={90} durationInFrames={120}>
      <Scan />
    </Sequence>
    <Sequence from={210} durationInFrames={120}>
      <Score />
    </Sequence>
    <Sequence from={330} durationInFrames={240}>
      <Findings />
    </Sequence>
    <Sequence from={570} durationInFrames={90}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
