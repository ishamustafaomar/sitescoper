import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// Scene durations (in frames @ 30fps), with 14-frame transition overlap each
// Hook 170 + Stats 200 + URL 150 + Scan 220 + Score 240 + Issues 250
// + Categories 220 + Quote 220 + BeforeAfter 250 + CTA 250 = 2170
// Transitions: 9 x 14 = 126 overlap -> total = 2044 (~68.1s)
export const TOTAL_FRAMES = 2044;

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1920}
    height={1080}
  />
);