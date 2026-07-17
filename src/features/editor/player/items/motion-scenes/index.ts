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
import { progressStepsModule } from "./progress-steps";
import { bulletedListModule } from "./bulleted-list";
import { listModule } from "./list";
import { horizontalTimelineModule } from "./horizontal-timeline";
import { tickerFeedModule } from "./ticker-feed";
import { commandDeckModule } from "./command-deck";
import { calendarMonthsModule } from "./calendar-months";
import { flowDiagramModule } from "./flow-diagram";
import { layerStackModule } from "./layer-stack";
import { networkSpreadModule } from "./network-spread";
import { networkDiagramModule } from "./network-diagram";
import { orgDiagramModule } from "./org-diagram";
import { conceptBuildModule } from "./concept-build";
import { annotatedScreenshotModule } from "./annotated-screenshot";
import { ratioDotsModule } from "./ratio-dots";
import { agentAvatarBurstModule } from "./agent-avatar-burst";
import { toolLogoBurstModule } from "./tool-logo-burst";
import { portraitBurstModule } from "./portrait-burst";

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
  progress_steps:    progressStepsModule,
  bulleted_list:     bulletedListModule,
  list:              listModule,
  horizontal_timeline: horizontalTimelineModule,
  ticker_feed:       tickerFeedModule,
  command_deck:      commandDeckModule,
  calendar_months:   calendarMonthsModule,
  flow_diagram:      flowDiagramModule,
  layer_stack:       layerStackModule,
  network_spread:    networkSpreadModule,
  network_diagram:   networkDiagramModule,
  org_diagram:       orgDiagramModule,
  concept_build:     conceptBuildModule,
  annotated_screenshot: annotatedScreenshotModule,
  ratio_dots:        ratioDotsModule,
  agent_avatar_burst: agentAvatarBurstModule,
  tool_logo_burst:   toolLogoBurstModule,
  portrait_burst:    portraitBurstModule,
};

export const MOTION_SCENE_KINDS = Object.keys(MOTION_SCENE_COMPONENTS);

export function getMotionSceneModule(kind: unknown): MotionSceneModule {
  return (typeof kind === "string" && MOTION_SCENE_COMPONENTS[kind]) || MOTION_SCENE_COMPONENTS.default;
}
