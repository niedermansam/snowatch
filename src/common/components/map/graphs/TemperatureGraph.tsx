"use client";
import React from "react";
import EChartsReact from "echarts-for-react";
import { useSettings } from "../useSettings";
import { INDIGO, PURPLE, RED } from "~/common/styles/ColorPalette";
import type { EChartsOption } from "echarts";
import { type ChartData, GRID, HEIGHT, tooltipDiv } from "./ForecastGraphs";

const TEMP_VISUAL_MAP_IMPERIAL = {
  show: false,
  min: 0,
  max: 128,
  inRange: {
    color: [
      INDIGO[800], // 0 - 8
      INDIGO[500], //  8 - 16
      INDIGO[300], // 16 -  24
      INDIGO[300], //  24 - 32
      PURPLE[500], // 32 - 40
      PURPLE[600], // 40 - 48
      PURPLE[500], // 48 - 56
      RED[300], // 56 - 64
      RED[400], // 64 - 72
      RED[500], // 72 - 80
      RED[600], // 80 - 88
      RED[700], // 88 - 96
      RED[700], // 96 - 104
      RED[700], // 104 - 112
      RED[700], // 112 - 120
      RED[700], // 120 - 128
    ],
  },
} satisfies EChartsOption["visualMap"];
const TEMP_VISUAL_MAP_METRIC = {
  show: false,
  min: -18,
  max: 53,
  inRange: {
    color: [
      INDIGO[800], // 0 - 8
      INDIGO[500], //  8 - 16
      INDIGO[300], // 16 -  24
      INDIGO[300], //  24 - 32
      PURPLE[500], // 32 - 40
      PURPLE[600], // 40 - 48
      PURPLE[500], // 48 - 56
      RED[300], // 56 - 64
      RED[400], // 64 - 72
      RED[500], // 72 - 80
      RED[600], // 80 - 88
      RED[700], // 88 - 96
      RED[700], // 96 - 104
      RED[700], // 104 - 112
      RED[700], // 112 - 120
      RED[700], // 120 - 128
    ],
  },
} satisfies EChartsOption["visualMap"];
export const TemperatureGraph = ({
  data,
}: {
  data: ChartData[] | undefined;
}) => {
  const { units } = useSettings();

  return (
    <EChartsReact
      className="-mt-2 max-h-[200px]"
      // group="forecast"
      option={{
        title: {
          subtext: "High and low temperature forecast for the next 7 days",
          textStyle: {
            fontSize: ".8rem",
            fontWeight: "bold",
          },
          subtextStyle: {
            fontSize: ".7rem",
          },
        },
        dataset: {
          dimensions: ["name", "temperature"],
          source: data,
        },
        visualMap:
          units === "metric"
            ? TEMP_VISUAL_MAP_METRIC
            : TEMP_VISUAL_MAP_IMPERIAL,
        grid: GRID,
        xAxis: { type: "category" },
        yAxis: { type: "value" },
        series: [
          {
            type: "line",
            stack: "snow",
            encode: { x: "name", y: "temperature" },
            smooth: true,
          },
        ],
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params: unknown) => {
            const typedParams = params as {
              data: { name: string; temperature: number; isDaytime: boolean };
              marker: string;
            }[];
            const { name, temperature } = typedParams[0]!.data;
            const marker = typedParams[0]!.marker;
            return `${tooltipDiv} ${name} <span class="font-bold">${marker}${
              typedParams[0]!.data.isDaytime ? "High" : "Low"
            } of ${temperature}°${
              units === "metric" ? "C" : "F"
            }</span></div> `;
          },
        },
      }}
      opts={{
        height: HEIGHT,
      }}
    />
  );
};
