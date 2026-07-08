import { JSX } from "react";
import {
  SlideDirection,
  circle,
  clockWipe,
  fade,
  flip,
  linearTiming,
  rectangle,
  slide,
  slidingDoors,
  star,
  wipe
} from "@designcombo/transitions";
import { TransitionSeries } from "@designcombo/transitions";
import type { TransitionPresentation } from "@designcombo/transitions";

// @remotion/transitions' TransitionPresentationComponentProps gained new
// required fields (onElementImage/onUnmount/bothEnteringAndExiting) after
// @designcombo/transitions' own compiled .d.ts was frozen against an older
// remotion/transitions version. The presentation components (fade/slide/wipe/
// flip/clockWipe) don't read those fields at runtime, so this is a type-only
// mismatch between the two packages' stale type copies — safe to bridge here.
const asPresentation = (p: unknown) => p as TransitionPresentation<any>;

interface TransitionOptions {
  width: number;
  height: number;
  durationInFrames: number;
  id: string;
  direction?: SlideDirection;
}

export const Transitions: Record<
  string,
  (options: TransitionOptions) => JSX.Element
> = {
  none: ({ id }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={asPresentation(fade())}
      timing={linearTiming({ durationInFrames: 1 })}
    />
  ),
  fade: ({ durationInFrames, id }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={asPresentation(fade())}
      timing={linearTiming({ durationInFrames })}
    />
  ),
  slide: ({ durationInFrames, id, direction }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={asPresentation(slide({ direction: direction }))}
      timing={linearTiming({ durationInFrames })}
    />
  ),
  wipe: ({ durationInFrames, id, direction }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={asPresentation(wipe({ direction: direction }))}
      timing={linearTiming({ durationInFrames })}
    />
  ),
  flip: ({ durationInFrames, id }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={asPresentation(flip())}
      timing={linearTiming({ durationInFrames })}
    />
  ),

  clockWipe: ({ width, height, durationInFrames, id }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={asPresentation(clockWipe({ width, height }))}
      timing={linearTiming({ durationInFrames })}
    />
  ),
  star: ({ width, height, durationInFrames, id }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={star({ width, height })}
      timing={linearTiming({ durationInFrames })}
    />
  ),
  circle: ({ width, height, durationInFrames, id }: TransitionOptions) => {
    return (
      <TransitionSeries.Transition
        key={id}
        presentation={circle({ width, height })}
        timing={linearTiming({ durationInFrames })}
      />
    );
  },
  rectangle: ({ width, height, durationInFrames, id }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={rectangle({ width, height })}
      timing={linearTiming({ durationInFrames })}
    />
  ),
  slidingDoors: ({
    width,
    height,
    durationInFrames,
    id
  }: TransitionOptions) => (
    <TransitionSeries.Transition
      key={id}
      presentation={slidingDoors({ width, height })}
      timing={linearTiming({ durationInFrames })}
    />
  )
};
