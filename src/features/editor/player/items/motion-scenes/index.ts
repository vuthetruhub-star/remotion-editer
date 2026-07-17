// motion-scenes/index.ts — registry: kind → module.
// Thêm một kind mới = tạo file kind + thêm 1 dòng vào MOTION_SCENE_COMPONENTS.
import type { MotionSceneModule } from "./types";
import { defaultModule } from "./default";
import { hookTitleModule } from "./hook-title";
import { statPunchModule } from "./stat-punch";
import { wordPopModule } from "./word-pop";
import { verticalTimelineModule } from "./vertical-timeline";
import { calloutModule } from "./callout";
import { quotePullModule } from "./quote-pull";
import { titleCardModule } from "./title-card";
import { metricRevealModule } from "./metric-reveal";
import { cinematicTitleModule } from "./cinematic-title";
import { kineticStatementModule } from "./kinetic-statement";
import { headlineCardModule } from "./headline-card";
import { keywordChipsModule } from "./keyword-chips";
import { bulletBurstModule } from "./bullet-burst";
import { statGridModule } from "./stat-grid";
import { barChartModule } from "./bar-chart";
import { barOverlayModule } from "./bar-overlay";
import { inlineChartModule } from "./inline-chart";
import { dashboardCardModule } from "./dashboard-card";

export type { MotionSceneModule } from "./types";

export const MOTION_SCENE_COMPONENTS: Record<string, MotionSceneModule> = {
  default:           defaultModule,
  hook_title:        hookTitleModule,
  stat_punch:        statPunchModule,
  word_pop:          wordPopModule,
  vertical_timeline: verticalTimelineModule,
  callout:           calloutModule,
  quote_pull:        quotePullModule,
  title_card:        titleCardModule,
  metric_reveal:     metricRevealModule,
  cinematic_title:   cinematicTitleModule,
  kinetic_statement: kineticStatementModule,
  headline_card:     headlineCardModule,
  keyword_chips:     keywordChipsModule,
  bullet_burst:      bulletBurstModule,
  stat_grid:         statGridModule,
  bar_chart:         barChartModule,
  bar_overlay:       barOverlayModule,
  inline_chart:      inlineChartModule,
  dashboard_card:    dashboardCardModule,
};

export const MOTION_SCENE_KINDS = Object.keys(MOTION_SCENE_COMPONENTS);

export function getMotionSceneModule(kind: unknown): MotionSceneModule {
  return (typeof kind === "string" && MOTION_SCENE_COMPONENTS[kind]) || MOTION_SCENE_COMPONENTS.default;
}
