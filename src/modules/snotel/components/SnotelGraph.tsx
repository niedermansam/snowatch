"use client";
import ReactECharts from "echarts-for-react";
import { type } from "os";
import { Snotel } from "../data";

type SnotelSnowGraphData = {
  xAxis: string[];
  snowDepth: number[];
};

export function SnotelSnowGraph({
  xAxis,
  snowDepth,
}: SnotelSnowGraphData) {
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

type TemperatureGraphData = {
  xAxis: string[];
  high: NullOrNumber[];
  low: NullOrNumber[];
  avg: NullOrNumber[];
};

export function SnotelTemperatureGraph({xAxis, high, low, avg}: TemperatureGraphData)  {
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

type SnotelGraphSectionProps = {
  snowData: SnotelSnowGraphData;
  temperatureData: TemperatureGraphData;
};

export function SnotelGraphSection({
  snotel
}: {snotel: InstanceType<typeof Snotel>}) {

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        animation: false,
      },
    },
    legend: {
      data: ["Evaporation", "Rainfall"],
      left: 10,
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        restore: {},
        saveAsImage: {},
      },
    },
    axisPointer: {
      link: [
        {
          xAxisIndex: "all",
        },
      ],
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        xAxisIndex: [0, 1],
      },
      {
        type: "inside",
        realtime: true,
        xAxisIndex: [0, 1],
      },
    ],
    grid: [
      {
        left: 60,
        right: 50,
        height: "33%",
      },
      {
        left: 60,
        right: 50,
        top: "55%",
        height: "33%",
      },
    ],
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: snotel.daily.map((d) => d.date),
        show: false,
      },
      {
        gridIndex: 1,
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: snotel.daily.map(d => d.date),
      },
    ],
    yAxis: [
      {
        name: "Temperature",
        type: "value",
        gridIndex: 0,
      },
      {
        gridIndex: 1,
        name: "Snow Depth",
        type: "value",
      },
    ],
    series: [
      {
        name: "Temperature",
        type: "line",
        symbolSize: 0,

        // prettier-ignore
        data: snotel.daily.map(d => d.temp.avg),
      },
      {
        name: "Minimum Temperature",
        type: "line",
        symbolSize: 0,
        data: snotel.daily.map(d => d.temp.min)
      },
      {
        name: "Maximum Temperature",
        type: "line",
        symbolSize: 0,
        data: snotel.daily.map(d => d.temp.max)
      },
      {
        name: "SnowDepth",
        type: "line",
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 0,

        // prettier-ignore
        data: snotel.daily.map(d => d.snow.depth),
      },
    ],
  };


  return <ReactECharts option={option} style={{
    height: 600
  }} />;
}