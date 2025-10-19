"use client";
import React,    { type LegacyRef } from "react";
// import the core library.
import ReactEChartsCore from "echarts-for-react/lib/core";
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from "echarts/core";
// Import charts, all with Chart suffix
import {
  LineChart,
  BarChart,
  // PieChart,
  // ScatterChart,
  // RadarChart,
  // MapChart,
  // TreeChart,
  // TreemapChart,
  // GraphChart,
  // GaugeChart,
  // FunnelChart,
  // ParallelChart,
  // SankeyChart,
  // BoxplotChart,
  // CandlestickChart,
  // EffectScatterChart,
  // LinesChart,
  // HeatmapChart,
  // PictorialBarChart,
  // ThemeRiverChart,
  // SunburstChart,
  // CustomChart,
} from "echarts/charts";
// import components, all suffixed with Component
import {
  // GridSimpleComponent,
  GridComponent,
  // PolarComponent,
  // RadarComponent,
  // GeoComponent,
  // SingleAxisComponent,
  // ParallelComponent,
  // CalendarComponent,
  // GraphicComponent,
  // ToolboxComponent,
  TooltipComponent,
  // AxisPointerComponent,
  // BrushComponent,
  TitleComponent,
  // TimelineComponent,
  // MarkPointComponent,
  // MarkLineComponent,
  // MarkAreaComponent,
  // LegendComponent,
  // LegendScrollComponent,
  // LegendPlainComponent,
  // DataZoomComponent,
  // DataZoomInsideComponent,
  // DataZoomSliderComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  // VisualMapPiecewiseComponent,
  // AriaComponent,
  // TransformComponent,
  DatasetComponent,
} from "echarts/components";
// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
  CanvasRenderer,
  // SVGRenderer,
} from "echarts/renderers";
import type { EChartsOption } from "echarts";
import type EChartsReactCore from "echarts-for-react/lib/core";

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
  LineChart,
  DatasetComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
]);

export function Echarts(props: {
  option: EChartsOption;
  onEvents?: Record<string, (params: unknown) => void>;
  opts?: Record<string, unknown>;
  className?: string;
  ref?: LegacyRef<EChartsReactCore> | undefined;
  group?: string;
  style?: Record<string, unknown>;
}) {
  return (
    <ReactEChartsCore
      className={props.className}
      ref={props.ref}
      echarts={echarts}
      option={props.option}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
      onChartReady={(instance) => {
        type Instance = {
          group: string;
        };
        if (props.group) {
          (instance as Instance).group = props.group;
          echarts.connect(props.group);
        }
      }}
      onEvents={props.onEvents}
      opts={props.opts}
      style={props.style}
    />
  );
}
