import { AbsoluteFill } from "remotion";
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
import { Flash } from "./scenes/Flash";
import { colors } from "./theme";

const T = 8;
const linear = linearTiming({ durationInFrames: T });

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={36}>
          <Flash word="AUDIT." tint={colors.accent} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={160}>
          <Stats />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <UrlPaste />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={36}>
          <Flash word="SCAN." tint={colors.primary} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={170}>
          <Scanning />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={190}>
          <ScoreReveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={200}>
          <Issues />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <Categories />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={36}>
          <Flash word="FIX." tint={colors.good} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-top" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={200}>
          <Quote />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={200}>
          <BeforeAfter />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip({ direction: "from-right" })} timing={linear} />

        <TransitionSeries.Sequence durationInFrames={240}>
          <CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};