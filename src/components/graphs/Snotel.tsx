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
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return  <ReactECharts option={options} />;
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
      },
      {
        data: high,
        type: "line",
        smooth: true,
      },
      {
        data: avg,
        type: "line",
        smooth: true,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return  <ReactECharts option={options} />;
}