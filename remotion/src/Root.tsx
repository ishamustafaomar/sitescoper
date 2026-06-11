import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// Scene durations (in frames @ 30fps), accounting for 12-frame transitions overlap
// Hook 130 + URL 130 + Scan 150 + Score 165 + Issues 175 + Categories 150 + CTA 170 = 1070
// Transitions: 6 x 12 = 72 overlap -> total = 998
export const TOTAL_FRAMES = 998;

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