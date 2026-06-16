import React from "react";
import { Composition, registerRoot } from "remotion";
import { RenderComposition, RenderCompositionProps } from "./RenderComposition";

const defaultProps: RenderCompositionProps = {
  trackItemIds: [],
  trackItemsMap: {},
  transitionsMap: {},
  fps: 30,
  size: { width: 1080, height: 1920 },
  background: { type: "color", value: "#000000" },
  duration: 5000,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnyRenderComposition = RenderComposition as React.ComponentType<any>;

const RemotionRoot = () => {
  return (
    <Composition
      id="MainComposition"
      component={AnyRenderComposition}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps as unknown as Record<string, unknown>}
      calculateMetadata={async ({ props }: { props: Record<string, unknown> }) => {
        const p = props as unknown as RenderCompositionProps;
        return {
          durationInFrames: Math.round((p.duration / 1000) * p.fps) || 1,
          fps: p.fps,
          width: p.size.width,
          height: p.size.height,
        };
      }}
    />
  );
};

registerRoot(RemotionRoot);
