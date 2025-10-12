/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from "react";
import type { UseForecastReturn } from "../hooks/useForecast";
import SChart from "~/common/ui/components/SChart";
import {
  BLUE,
  GRAY,
  INDIGO,
  PURPLE,
  RED,
  YELLOW,
} from "~/common/styles/ColorPalette";
import { EChartsOption } from "echarts";
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
  const cumulativeHighForecast = data.snow.getCumulativeHighSnow();

  const totalSnowExpected =
    cumulativeHighForecast[cumulativeHighForecast.length - 1] ?? 0;

  const snowInForecast = totalSnowExpected > 0;

  const tempSeries = [
    {
      name: "Temperature",
      type: "line",
      data: data.temperature.getTemperature(),
      smooth: true,
      xAxisIndex: snowInForecast ? 2 : 0,
      yAxisIndex: snowInForecast ? 2 : 0,
      markLine: {
        animation: false,
        symbol: "none",
        data: [
          {
            name: "Freezing",
            yAxis: 32,
            symbol: "none",
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
          dy: !currentPeriod?.isDaytime
            ? 30
            : (params.dataIndex as number) <= 1
            ? 5
            : 0,
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
      xAxisIndex: snowInForecast ? 3 : 1,
      yAxisIndex: snowInForecast ? 3 : 1,

      label: {
        show: true,
        align: "left",
        formatter: (params) => {
          const value = Number(params.value);
          return value > 0 ? value.toString() + " mph" : "";
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
      xAxisIndex: snowInForecast ? 3 : 1,
      yAxisIndex: snowInForecast ? 3 : 1,
      label: {
        show: true,
        formatter: (params) => {
          const currentPeriod = data.properties?.periods[params.dataIndex];

          const highLowIsSame =
            data.wind.getLowWind()[params.dataIndex] ===
            data.wind.getHighWind()[params.dataIndex];

          if (highLowIsSame) return "";

          const gusts = data.wind.getGusts();

          const gustData = gusts ? gusts[params.dataIndex] : 0;
          const value = Number(params.value);
          const outString = value > 0 ? value.toString() + " mph" : "";
          return (gustData ? "   " : "") + outString;
        },
      },
      emphasis: {
        disabled: true,
      },
      labelLayout: (params) => {
        const gusts = data.wind.getGusts();
        const currentGusts = gusts ? gusts[params.dataIndex || 0] : 0;
        return {
          dy: !currentGusts ? 0 : 25,
        };
      },
    },
    {
      data: data.wind.getGusts("stacked") as number[],
      type: "bar",
      barWidth: 10,
      stack: "gusts",
      colorBy: "series",
      itemStyle: { color: RED[600], borderRadius: 4, opacity: 0.7 },
      name: "gusts",
      xAxisIndex: snowInForecast ? 3 : 0,
      yAxisIndex: snowInForecast ? 3 : 0,
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
      seriesIndex: snowInForecast ? [4] : [0],
    },
    {
      show: false,
      type: "continuous",
      min: 0,
      max: 60,
      seriesIndex: snowInForecast ? [5, 6] : [1, 2], // Wind Graph
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

  const dailySnowSeries = [
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
          return value > 0 ? value.toString() + '"' : "";
        },
      },
      labelLayout: (params) => {
        const currentPeriod =
          data.properties?.periods[params.dataIndex as number];

        const lowSnowExists =
          data.snow.data[params.dataIndex as number]?.lowSnow;

        return {
          dy: !lowSnowExists ? -30 : 0,
        };
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
      data: data.snow.getHighSnow(true),

      label: {
        show: true,
        formatter: (params) => {
          const value = Number(params.value);
          const lowValue = data.snow.getLowSnowArray()[params.dataIndex] || 0;
          return value > 0 ? (value + lowValue).toString() + '"' : "";
        },
      },
      color: INDIGO[300],
      emphasis: {
        disabled: true,
      },
    },
  ] satisfies EChartsOption["series"];

  const cummulativeSnowSeries = [
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
          return value > 0 ? value.toString() + '"' : "";
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
          return value > 0 ? value.toString() + '"' : "";
        },
      },
    },
  ] satisfies EChartsOption["series"];

  const optionsWithSnow = {
    animation: false,
    title: [
      {
        top: "5%",
        left: 20,
        text: "Daily Snowfall",
        textStyle: {
          color: "#616E7C",
        },
      },
      {
        text: "Total Snowfall",
        left: 20,
        top: "25%",
        textStyle: {
          color: "#616E7C",
        },
      },
      {
        text: "Temperature",
        top: "45%",
        left: 20,
        textStyle: {
          color: "#616E7C",
        },
      },
      {
        text: "Wind",
        top: "65%",
        left: 20,
        textStyle: {
          color: "#616E7C",
        },
      },
    ],
    visualMap,
    grid: stacked,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (foo) {
        //  console.log(params[0].dataIndex);
        const params = foo as unknown;

        if (!Array.isArray(params)) return "";

        if (
          typeof params[0] !== "object" ||
          "dataIndex" in params[0] === false ||
          // es-lint-disable @typescript-eslint/no-unsafe-member-access
          typeof params[0].dataIndex !== "number"
        )
          return "";

        // es-lint-disable @typescript-eslint/no-unsafe-member-access
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
      {
        gridIndex: 1,
        max: Math.ceil((totalSnowExpected + 5) / 6) * 6,

        interval: 6,
      },
      {
        gridIndex: 2,
        max:
          Math.ceil(
            (data.temperature.getHottestPeriod().temperature + 10) / 10
          ) * 10,
      },
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
      ...dailySnowSeries,

      ...cummulativeSnowSeries,
      ...tempSeries,
      ...windSeries,
    ],
  } satisfies EChartsOption;

  const optionsWithoutSnow = {
    animation: false,
    title: [
      {
        text: "Temperature",
        top: "5%",
        left: 20,
        textStyle: {
          color: "#616E7C",
        },
      },
      {
        text: "Wind",
        top: "25%",
        left: 20,
        textStyle: {
          color: "#616E7C",
        },
      },
    ],
    visualMap,
    grid: [
      { left: "25px", bottom: "80%", width: "95%", height: "12%" },
      { left: "25px", bottom: "60%", width: "95%", height: "12%" },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (foo) {
        //  console.log(params[0].dataIndex);
        const params = foo as unknown;

        if (!Array.isArray(params)) return "";

        if (
          typeof params[0] !== "object" ||
          "dataIndex" in params[0] === false ||
          // es-lint-disable @typescript-eslint/no-unsafe-member-access
          typeof params[0].dataIndex !== "number"
        )
          return "";

        // es-lint-disable @typescript-eslint/no-unsafe-member-access
        if (selectedPeriod === params[0].dataIndex) return "";

        setSelectedPeriod(params[0].dataIndex);
        return "";
      },
    },
    xAxis: [
      { gridIndex: 0, data: data.getDateLabels() },
      { gridIndex: 1, data: data.getDateLabels() },
    ],
    yAxis: [
      {
        gridIndex: 0,
        max:
          Math.ceil(
            (data.temperature.getHottestPeriod().temperature + 10) / 10
          ) * 10,
      },
      { gridIndex: 1 },
    ],
    axisPointer: {
      link: [
        {
          xAxisIndex: "all",
        },
      ],
    },
    series: [...tempSeries, ...windSeries],
  } satisfies EChartsOption;

  return (
    <div className="grid min-h-screen md:grid-cols-[1fr_200px]">
      <SChart
        option={snowInForecast ? optionsWithSnow : optionsWithoutSnow}
        style={{
          height: "700px",
          minHeight: "80vh",
        }}
      />
      {data.snow.data[selectedPeriod] !== undefined && (
        <PeriodSummary data={data.snow.data[selectedPeriod]} />
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
    <div className="flex flex-col gap-2 p-4 text-sm md:mt-8">
      <h3 className=" pb-2 font-bold">{period} </h3>
      <p className="text-sm font-light">
        {snowText ? snowText + " of snow" : "No snow"}
      </p>
      {data.detailedForecast}
    </div>
  );
}
