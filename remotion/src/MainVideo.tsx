import { AbsoluteFill, Audio, staticFile, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { flip } from "@remotion/transitions/flip";
import { Background } from "./components/Background";
import { Hook } from "./scenes/Hook";
import { Stats } from "./scenes/Stats";
import { UrlPaste } from "./scenes/UrlPaste";
import { Scanning } from "./scenes/Scanning";
import { ScoreReveal } from "./scenes/ScoreReveal";
import { Issues } from "./scenes/Issues";
import { Categories } from "./scenes/Categories";
import { Quote } from "./scenes/Quote";
import { BeforeAfter } from "./scenes/BeforeAfter";
import { CTA } from "./scenes/CTA";
import { TOTAL_FRAMES } from "./Root";

const AudioBed: React.FC = () => {
  const frame = useCurrentFrame();
  // fade in over 18f, hold, fade out over last 60f
  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [TOTAL_FRAMES - 60, TOTAL_FRAMES], [1, 0], { extrapolateLeft: "clamp" });
  const volume = Math.min(fadeIn, fadeOut) * 0.85;
  return <Audio src={staticFile("audio/track.mp3")} volume={volume} />;
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <AudioBed />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={170}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={200}>
          <Stats />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <UrlPaste />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={220}>
          <Scanning />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={240}>
          <ScoreReveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={250}>
          <Issues />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={220}>
          <Categories />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={220}>
          <Quote />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-top" })} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={250}>
          <BeforeAfter />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={250}>
          <CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};