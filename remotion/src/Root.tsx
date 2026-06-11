import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// Fast-paced cut: 13 scenes incl. 3 flash interstitials, 8-frame transitions
// 130+36+160+120+36+170+190+200+180+36+200+200+240 = 1898
// 12 x 8 transitions = 96 overlap -> total = 1802 (~60.07s)
export const TOTAL_FRAMES = 1802;

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