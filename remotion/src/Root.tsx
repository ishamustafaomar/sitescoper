import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// Scene durations (in frames @ 30fps), accounting for 12-frame transitions overlap
// Hook 60 + URL 75 + Scan 80 + Score 95 + Issues 95 + Categories 75 + CTA 95 = 575
// Transitions: 6 x 12 = 72 overlap -> total = 503
export const TOTAL_FRAMES = 503;

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