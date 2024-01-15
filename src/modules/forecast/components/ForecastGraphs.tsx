import React, { useRef } from "react";
import type { UseForecastReturn } from "../hooks/useForecast";
import SChart from "~/common/components/SChart";
import { ECBasicOption } from "echarts/types/dist/shared";
import EChartsReactCore from "echarts-for-react/lib/core";
import {
  BLUE,
  GRAY,
  INDIGO,
  PURPLE,
  RED,
  YELLOW,
} from "~/common/styles/ColorPalette";
import { EChartsOption } from "echarts";
import { debounce } from "~/common/hooks/debounce";
import { parse } from "path";
//  data: NonNullable<UseForecastReturn["data"]>;

const fourSquares = [
  { left: "7%", top: "7%", width: "38%", height: "38%" },
  { right: "7%", top: "7%", width: "38%", height: "38%" },
  { left: "7%", bottom: "7%", width: "38%", height: "38%" },
  { right: "7%", bottom: "7%", width: "38%", height: "38%" },
];

const stacked = [
  { left: "25px", bottom: "80%", width: "95%", height: "12%" },
  { left: "25px", bottom: "60%", width: "95%", height: "12%" },
  { left: "25px", bottom: "40%", width: "95%", height: "12%" },
  { left: "25px", bottom: "20%", width: "95%", height: "12%" },
];

export function ForecastGraphs({
  data,
}: {
  data: NonNullable<UseForecastReturn["data"]>;
}) {
  const [selectedPeriod, setSelectedPeriod] = React.useState(0);

  const tempSeries = [
    {
      name: "Temperature",
      type: "line",
      data: data.temperature.getTemperature(),
      smooth: true,
      xAxisIndex: 2,
      yAxisIndex: 2,
      markLine: {
        animation: false,
        data: [
          {
            name: "Freezing",
            yAxis: 32,
            label: {
              show: false,
            },
            emphasis: {
              disabled: true,
            },
            lineStyle: {
              color: PURPLE[500],
              type: "dashed",
            },
          },
        ],
      },
      label: {
        show: true,
        formatter: (params) => {
          const value = Number(params.value);
          return value.toString() + "°";
        },
      },

      labelLayout: (params) => {
        const currentPeriod =
          data.properties?.periods[params.dataIndex as number];
        return {
          dy: currentPeriod?.isDaytime ? 0 : 30,
        };
      },
    },
  ] satisfies EChartsOption["series"];

  const windSeries = [
    {
      data: data.wind.getLowWind(),
      type: "line",
      smooth: true,
      name: "low-wind",
      xAxisIndex: 3,
      yAxisIndex: 3,

      label: {
        show: true,
        align: "left",
        formatter: (params) => {
          const value = Number(params.value);
          return (value as number) > 0 ? value.toString() + " mph" : "";
        },
        position: "bottom",
      },
      emphasis: {
        disabled: true,
      },
    },
    {
      data: data.wind.getHighWind(),
      type: "line",
      smooth: true,
      stack: "gusts",
      name: "high-wind",
      xAxisIndex: 3,
      yAxisIndex: 3,
      label: {
        show: true,
        formatter: (params) => {
          const currentPeriod =
            data.properties?.periods[params.dataIndex as number];

          const highLowIsSame =
            data.wind.getLowWind()[params.dataIndex as number] ===
            data.wind.getHighWind()[params.dataIndex as number];

          if (highLowIsSame) return "";

          const gusts = data.wind.getGusts()![params.dataIndex as number];
          const value = Number(params.value);
          const outString =
            (value as number) > 0 ? value.toString() + " mph" : "";
          return (gusts ? "   " : "") + outString;
        },
      },
      emphasis: {
        disabled: true,
      },
      labelLayout: (params) => {
        const gusts = data.wind.getGusts()![params.dataIndex as number];
        return { 
          dy: !gusts ? 0 : 25,
        };
      }
    },
    {
      data: data.wind.getGusts("stacked") as number[],
      type: "bar",
      barWidth: 10,
      stack: "gusts",
      colorBy: "series",
      itemStyle: { color: RED[600], borderRadius: 4, opacity: 0.7 },
      name: "gusts",
      xAxisIndex: 3,
      yAxisIndex: 3,
      emphasis: {
        disabled: true,
      },
      // label: {
      //   show: true,
      //   align: "center",
      //   formatter: (params) => {
      //     const currentPeriod =
      //       data.properties?.periods[params.dataIndex as number];

      //     const gusts = data.wind.getGusts()![params.dataIndex as number] || 0;
      //     return gusts > 0 ? gusts.toString() + " mph\ngusts" : "";
      //   },
      //   position: "top",
      // },
    },
  ] satisfies EChartsOption["series"];

  const visualMap = [
    {
      show: false,
      type: "continuous",
      min: 0,
      max: 32 * 4, // 128
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
      seriesIndex: [4],
    },
    {
      show: false,
      type: "continuous",
      min: 0,
      max: 60,
      seriesIndex: [5, 6], // Wind Graph
      inRange: {
        color: [
          GRAY[100],
          GRAY[300],
          YELLOW[500],
          YELLOW[500],
          RED[300],
          RED[500],
        ],
      },
      outOfRange: {
        color: RED[700],
      },
    },
  ] satisfies EChartsOption["visualMap"];

  const option = {
    animation: false,
    title: [
      {
        top: "3%",
        text: "Daily Snowfall",
      },
      {
        text: "Total Snowfall",
        top: "23%",
      },
      {
        text: "Temperature",
        top: "43%",
      },
      {
        text: "Wind",
        top: "63%",
      },
    ],
    visualMap,
    grid: stacked,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        //  console.log(params[0].dataIndex);
        if (params === undefined || params === null) return "";
        if (Array.isArray(params) === false) return "";
        if (params[0] === undefined || params[0] === null) return "";

        if (
          typeof params[0] !== "object" ||
          "dataIndex" in params[0] === false ||
          typeof params[0].dataIndex !== "number"
        )
          return "";

        if (selectedPeriod === params[0].dataIndex) return "";

        setSelectedPeriod(params[0].dataIndex);
        return "";
      },
    },
    xAxis: [
      { gridIndex: 0, data: data.getDateLabels() },
      { gridIndex: 1, data: data.getDateLabels() },
      { gridIndex: 2, data: data.getDateLabels() },
      { gridIndex: 3, data: data.getDateLabels() },
    ],
    yAxis: [
      { gridIndex: 0 },
      { gridIndex: 1 },
      { gridIndex: 2 },
      { gridIndex: 3 },
    ],
    axisPointer: {
      link: [
        {
          xAxisIndex: "all",
        },
      ],
    },
    series: [
      {
        name: "Low Snow Daily",
        type: "bar",
        stack: "daily",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.snow.getLowSnowArray(),
        color: INDIGO[500],
        label: {
          show: true,
          formatter: (params) => {
            const value = Number(params.value);
            return (value as number) > 0 ? value.toString() + '"' : "";
          },
        },
        emphasis: {
          disabled: true,
        },
      },
      {
        name: "High Snow Daily",
        type: "bar",
        stack: "daily",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.snow.getHighSnow(),

        label: {
          show: true,
          formatter: (params) => {
            const value = Number(params.value);
            return (value as number) > 0 ? value.toString() + '"' : "";
          },
        },
        color: INDIGO[300],
        emphasis: {
          disabled: true,
        },
      },

      {
        name: "Low Snow Accumulation",
        type: "line",
        xAxisIndex: 1,
        yAxisIndex: 1,
        color: INDIGO[500],
        data: data.snow.getCumulativeLowSnow(),
        step: "middle",
        areaStyle: {},
        emphasis: {
          disabled: true,
        },
        label: {
          show: true,
          formatter: (params) => {
            const previousPeriod =
              data.snow.getCumulativeLowSnow()[params.dataIndex - 1];

            const lowSnowHasChanged = previousPeriod !== params.value;

            if (!lowSnowHasChanged) return "";
            const value = Number(params.value);
            return (value as number) > 0 ? value.toString() + '"' : "";
          },
        },
        symbolSize: 0,
      },
      {
        name: "High Snow Accumulation",
        type: "line",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.snow.getCumulativeHighSnow(),
        dataGroupId: "snow",
        seriesLayoutBy: "row",
        color: INDIGO[300],
        step: "middle",
        symbolSize: 0,
        areaStyle: {},
        emphasis: {
          disabled: true,
        },
        label: {
          show: true,
          formatter: (params) => {
            const previousPeriod =
              data.snow.getCumulativeHighSnow()[params.dataIndex - 1];

            const highSnowHasChanged = previousPeriod !== params.value;

            if (!highSnowHasChanged) return "";

            const value = Number(params.value);
            return (value as number) > 0 ? value.toString() + '"' : "";
          },
        },
      },
      ...tempSeries,
      ...windSeries,
    ],
  } satisfies EChartsOption;

  return (
    <div className="grid min-h-screen grid-cols-[1fr_200px]">
      <SChart
        option={option}
        style={{
          height: "700px",
          minHeight: "80vh",
        }}
      />
      {data.snow.data[selectedPeriod] !== undefined && (
        <PeriodSummary data={data.snow.data[selectedPeriod]!} />
      )}
    </div>
  );
}

function PeriodSummary({
  data,
}: {
  data: NonNullable<UseForecastReturn["data"]>["snow"]["data"][number];
}) {
  const { lowSnow, highSnow, period, snowText } = data;
  return (
    <div className="mt-8 flex flex-col gap-2 p-4 text-sm">
      <h3 className=" pb-2 font-bold">{period} </h3>
      <p className="text-sm font-light">
        {snowText ? snowText + " of snow" : "No snow"}
      </p>
      {data.detailedForecast}
    </div>
  );
}
