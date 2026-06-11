import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// Ultra fast-paced cut: 13 scenes incl. 3 flash interstitials, 6-frame transitions
// 80+24+100+70+24+110+120+130+110+24+130+130+160 = 1212
// 12 x 6 transitions = 72 overlap -> total = 1140 (~38.0s)
export const TOTAL_FRAMES = 1140;

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