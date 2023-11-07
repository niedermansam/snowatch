import React from "react";
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
  LinesChart,
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
  AriaComponent,
  // TransformComponent,
  DatasetComponent,
} from "echarts/components";
// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";

// Register the required components
echarts.use([
  VisualMapComponent,
  VisualMapContinuousComponent,
  SVGRenderer,
  LinesChart,
  AriaComponent,
  DatasetComponent,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
]);

type MouseEventNames = 'click' | 'dblclick' | 'mousedown'  | 'mousemove' | 'mouseover' | 'mouseout' | 'globalout' | 'contextmenu';

export type EchartMouseEventParams<T extends MouseEventNames> = {
  componentType: string;
  componentSubType: string;
  seriesType: string;
  seriesIndex: number;
  seriesName: string;
  name: string;
  dataIndex: number;
  data: number;
  dataType?: string;
  value: number | number[];
  color: string;
  info?: Record<string, unknown>;
  event: React.MouseEvent<HTMLElement, MouseEvent>;
}


export type EchartMouseEvent= {
  componentType: string;
  componentSubType: string;
  seriesType: string;
  seriesIndex: number;
  seriesName: string;
  name: string;
  dataIndex: number;
  data: number;
  dataType?: string;
  value: number | number[];
  color: string;
  info?: Record<string, unknown>;
  event: React.MouseEvent<HTMLElement, MouseEvent>;
}


type EChartMouseEvents<T extends MouseEventNames> = Record<T, (params: EchartMouseEventParams<T>) => void >


type HighlightEventObj = {
  type: 'highlight';
  dataIndex?: number | number[];
  seriesIndex?: number | number[];
  seriesId?: string | string[];
  seriesName?: string | string[];
  name?: string | string[];
}

type HighlightEventParams = {
  type: 'highlight';
  batch: HighlightEventObj[];
}



export type EChartEvents= 
  Partial<Record<MouseEventNames, (params: EchartMouseEvent) => void>> | 
  Record<'highlight', (params: HighlightEventParams) => void>


type SChartProps = {
  option: echarts.EChartsCoreOption;
  style?: React.CSSProperties;
  theme?: string;
  onEvents?: EChartEvents;
  actions?: any;
  chartRef?: React.ForwardedRef<ReactEChartsCore>;
  group?: string;
};

function SChartBase({
  option,
  style,
  theme,
  onEvents,
  ref
}:  SChartProps & {  ref?: React.ForwardedRef<ReactEChartsCore> }) {


  return (
    typeof window !== "undefined" && (
      <ReactEChartsCore


        echarts={echarts}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        option={option}
        notMerge={true}
        lazyUpdate={true}
        theme={theme}
        style={style}
        ref={ref}
        onEvents={onEvents}
      />
    )
  );
}

const SChart = React.forwardRef<ReactEChartsCore, SChartProps>(function SChart (props, ref)  {
  return (
    <ReactEChartsCore
      echarts={echarts}
      notMerge={false}
      lazyUpdate={false}
      onChartReady={(e: {
        group: string | undefined;
      }) => {
        e.group = props.group;


      }}
      {...props}
      ref={ref}
    />
  );
} );

export default SChart;
