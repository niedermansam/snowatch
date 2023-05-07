"use client";
import ReactECharts from "echarts-for-react";

export function SnotelSnowGraph({
  xAxis,
  snowDepth,
}: {
  xAxis: string[];
  snowDepth: number[];
}) {
  const options = {
    grid: { top: 8, right: 8, bottom: 15, left: 36 },
    xAxis: {
      type: "category",
      data: xAxis,
      axisLabel: {
        fontWeight: "bolder",
        fontSize: 8,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: snowDepth,
        type: "line",
        smooth: true,
        showSymbol: false,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return  <ReactECharts option={options} />;
}

export function SnotelSnowGraphWithoutAxis({
  snowDepth,
  width,
  height,
}: {
  snowDepth: number[];
  width?: number | string;
  height?: number | string;
}) {
  const options = {
    grid: { top: 8, right: 8, bottom: 0, left: 36, width, height },
    xAxis: {
      type: "category",
      data: [],
      axisLabel: {
        fontWeight: "bolder",
        fontSize: 8,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: snowDepth,
        type: "line",
        smooth: true,

        showSymbol: false,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return (
    <ReactECharts

      option={options}

    />
  );
}

  

type NullOrNumber = number | null;

export function SnotelTemperatureGraph({xAxis, high, low, avg}: {
  xAxis: string[];
  high: NullOrNumber[];
  low: NullOrNumber[];
  avg: NullOrNumber[];
})  {
  const options = {
    grid: { top: 8, right: 8, bottom: 90, left: 36 },
    xAxis: {
      type: "category",
      data: xAxis,
      axisLabel: {
        fontWeight: "bolder",
        fontSize: 8,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: low,
        type: "line",
        smooth: true,
        showSymbol: false,
      },
      {
        data: high,
        type: "line",
        smooth: true,
        showSymbol: false,
      },
      {
        data: avg,
        type: "line",
        smooth: true,
        showSymbol: false,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return  <ReactECharts option={options} />;
}

export function SnotelTemperatureGraphWithoutAxis({
  high,
  low,
  avg,
  width, 
  height,
}: {
  high: NullOrNumber[];
  low: NullOrNumber[];
  avg: NullOrNumber[];
  width?: number | string;
  height?: number | string;
}) {
  const options = {
    grid: { top: 8, right: 8, bottom: 10, left: 36, width: width || "auto", height: height || "auto" },
    xAxis: {
      type: "category",
      data: [],
      axisLabel: {
        fontWeight: "bolder",
        fontSize: 8,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: low,
        type: "line",
        smooth: true,
        showSymbol: false,
      },
      {
        data: high,
        type: "line",
        smooth: true,
        showSymbol: false,
      },
      {
        data: avg,
        type: "line",
        smooth: true,
        showSymbol: false,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return  <ReactECharts  option={options} />;

}