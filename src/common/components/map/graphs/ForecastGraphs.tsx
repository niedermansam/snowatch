/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";
import React from "react";
import type { useDailyForecast } from "~/common/components/hooks/noaa/useDailyForecast";
import { Echarts } from "../../echarts";
import { useSettings } from "../useSettings";
import { UnitConverter } from "~/app/UnitConverter";
import { TemperatureGraph } from "./TemperatureGraph";
import { ForecastWindGraph } from "~/modules/forecast/components/ForecastWindGraph";
import { twMerge } from "tailwind-merge";
import { set } from "zod";
import EChartsReactCore from "echarts-for-react/lib/core";
import { WeatherIcon } from "../../hooks/weather-icon-mapper";

type Params = {
  data: {
    name: string;
    minSnow: number;
    maxSnow: number;
    minTotalSnow: number;
    maxTotalSnow: number;
    minWindSpeed: number;
    maxWindSpeed: number;
  };
  color: string;
  dataIndex: number;
};

export type ChartData = {
  name: string;
  minSnow: number;
  maxSnow: number;
  minTotalSnow: number;
  maxTotalSnow: number;
  temperature: number;
};

export const GRID = { top: 50, right: 20, bottom: 45, left: 30 };

export const HEIGHT = 200;

export const tooltipDiv =
  '<div style="display:flex;flex-direction:column;min-width:200px;">';
const parseWindData = (text: string, units: "imperial" | "metric") => {
  const windSpeed = /(\d+)(?:\s*to\s*(\d+))?/.exec(text);

  if (!windSpeed)
    return {
      minWindSpeed: 0,
      maxWindSpeed: 0,
    };

  const minWindSpeed = parseInt(windSpeed[1] ?? "0");
  const maxWindSpeed = parseInt(windSpeed[2] ?? windSpeed[1] ?? "0");

  return {
    minWindSpeed:
      units === "metric"
        ? minWindSpeed
        : Math.round(UnitConverter.kphToMph(minWindSpeed)),
    maxWindSpeed:
      units === "metric"
        ? maxWindSpeed
        : Math.round(UnitConverter.kphToMph(maxWindSpeed)),
  };
};

export const ForecastGraphs = ({
  dailyForecast,
}: {
  dailyForecast: ReturnType<typeof useDailyForecast>;
}) => {
  const { units } = useSettings();

  const [highlightedPeriod, setHighlightedPeriod] = React.useState<
    number | null
  >(null);

  const chartData = React.useMemo(() => {
    let cummulativeMin = 0;
    let cummulativeMax = 0;

    return dailyForecast.data?.data.map((period) => {
      const minSnow = period.snow.min;
      const maxSnow = period.snow.max;

      cummulativeMin += minSnow;
      cummulativeMax += maxSnow;

      const temperature = period.temperature;

      const { minWindSpeed, maxWindSpeed } = parseWindData(
        period.windSpeed,
        units
      );

      return {
        name: period.name,
        minSnow,
        maxSnow: maxSnow - minSnow,
        minTotalSnow: cummulativeMin,
        maxTotalSnow: cummulativeMax - cummulativeMin,
        temperature,
        minWindSpeed,
        maxWindSpeed,
        groupId: "forecast",
        isDaytime: period.isDaytime,
      };
    });
  }, [dailyForecast.data, units]);

  const lastPeriod = chartData ? chartData[chartData.length - 1] : null;

 

  return (
    <div className="grid h-full  min-h-fit grid-cols-[2fr_1fr] gap-x-4 gap-y-6 pb-12">
      <div>
        {/* Hidden echarts graph with ONLY dates to highlight.
          - When a user hovers over a bar in any of the other graphs, this graph will highlight the corresponding date
          - This prevents a flicker when the user hovers between different graphs
        */}
        <Echarts
          className="h-200 invisible  absolute max-h-[200px]  "
          group="forecast"
          option={{
            grid: GRID,
            xAxis: { type: "category" },
            yAxis: { type: "value" },
            series: [
              {
                type: "bar",
                stack: "snow",
                encode: { x: "name", y: "minSnow" },
                data: chartData?.map(() => 10) ?? [], // invisible bars with 0 height
              },
            ],
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "shadow" },
            },
          }}
          // onEvents={{
          //   highlight: (params) => {
          //     const typedParams = params as { batch: { dataIndex: number }[] };
          //     setHighlightedPeriod(typedParams.batch[0]?.dataIndex ?? null);
          //   },
          // }}
          onEvents={{
            highlight: (params) => {
              const typedParams = params as { batch: { dataIndex: number }[] };
              setHighlightedPeriod(typedParams.batch[0]?.dataIndex ?? null);
            },
          }}
        />
        {lastPeriod?.maxTotalSnow === 0 ? (
          <div className="mb-2 py-4 text-center text-sm font-semibold text-muted-foreground">
            No snow forecasted for the next 7 days
          </div>
        ) : (
          <>
            <div className="row-span-2 space-y-2">
              <h3 className="ml-1 text-[.8rem] font-bold ">Snow Forecast</h3>
              <Echarts
                className="-mt-2 max-h-[200px]"
                group="forecast"
                option={{
                  title: {
                    subtext:
                      "Daily snow accumulation forecast for the next 7 days",
                    textStyle: {
                      fontSize: ".8rem",
                      fontWeight: "bold",
                    },
                    subtextStyle: {
                      fontSize: ".7rem",
                    },
                  },
                  dataset: {
                    dimensions: ["name", "minSnow", "maxSnow"],
                    source: chartData,
                  },
                  grid: GRID,
                  xAxis: { type: "category" },
                  yAxis: { type: "value" },
                  series: [
                    {
                      type: "bar",
                      stack: "snow",
                      encode: { x: "name", y: "minSnow" },
                      color: "#0284c7",
                      dataGroupId: "forecast",
                    },
                    {
                      type: "bar",
                      stack: "snow",
                      encode: { x: "name", y: "maxSnow" },
                      color: "#0ea5e9",
                    },
                  ],
                  tooltip: {
                    trigger: "axis",
                    axisPointer: { type: "shadow" },
                    formatter: (params: unknown) => {
                      const typedParams = params as Params[];
                      const data = typedParams[0]!;
                      const { name, minSnow, maxSnow } = data.data;
                      const color1 = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></span>`;
                      const unit = units === "metric" ? "cm" : "in";
                      // capturing regex to replace "on tonight" with "tonight", "on today" with "today". There may be other cases like "evening" or "morning" that need to be handled
                      const snowString =
                        maxSnow === 0
                          ? `${minSnow} ${unit}`
                          : `${minSnow} - ${maxSnow + minSnow} ${unit}`;
                      if (maxSnow === 0)
                        return `${tooltipDiv}No Snow on ${name}</div>`
                          .replace(/\bon\s+(tonight|today)\b/gi, "$1")
                          .replace(/on This Afternoon/gi, "this Afternoon");
                      return (
                        `${tooltipDiv}` +
                        `<div  class="text-xs" >New Snow on ${name}</div>`
                          .replace(/\bon\s+(tonight|today)\b/gi, "$1")
                          .replace(/on This Afternoon/gi, "this Afternoon") +
                        `<div class="font-bold">${color1} ${snowString}</div>` +
                        `</div>`
                      );
                    },
                  },
                }}
                opts={{
                  height: HEIGHT,
                }}
              />
              <Echarts
                group="forecast"
                className="max-h-[200px]"
                option={{
                  title: {
                    subtext:
                      "Total new snow accumulation forecast for the next 7 days",
                    textStyle: {
                      fontSize: ".8rem",
                      fontWeight: "bolder",
                    },
                    subtextStyle: {
                      fontSize: ".7rem",
                    },
                  },
                  dataset: {
                    dimensions: ["name", "minTotalSnow", "maxTotalSnow"],
                    source: chartData,
                  },
                  grid: GRID,
                  xAxis: { type: "category" },
                  yAxis: { type: "value" },
                  series: [
                    {
                      type: "bar",
                      stack: "snow",
                      encode: { x: "name", y: "minTotalSnow" },
                      color: "#0284c7",
                    },
                    {
                      type: "bar",
                      stack: "snow",
                      encode: { x: "name", y: "maxTotalSnow" },
                      color: "#0ea5e9",
                    },
                  ],
                  tooltip: {
                    trigger: "axis",
                    axisPointer: { type: "shadow" },
                    confine: true,
                    formatter: (params: unknown) => {
                      const typedParams = params as Params[];
                      const data = typedParams[0]!;
                      const { name, minTotalSnow, maxTotalSnow } = data.data;
                      const color1 = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></span>`;
                      const unit = units === "metric" ? "cm" : "in";
                      let snowString =
                        maxTotalSnow === 0
                          ? `${minTotalSnow} ${unit}`
                          : `${minTotalSnow} - ${
                              maxTotalSnow  + minTotalSnow
                            } ${unit}`;
                      if ((maxTotalSnow + minTotalSnow) === minTotalSnow) {
                        snowString = `${minTotalSnow} ${unit}`;
                      }
                      if (maxTotalSnow === 0)
                        return (
                          tooltipDiv +
                          "No Snow" +
                          ` by ${name}</div>`
                            .replace(/\bon\s+(tonight|today)\b/gi, "$1")
                            .replace(/by This Afternoon/gi, "this Afternoon")
                        );
                      return (
                        tooltipDiv +
                        `<div  class="text-xs" >Total Accumulation by ${name}</div>` +
                        `<div class="font-bold">${color1} ${snowString}</div>` +
                        `</div>`
                      );
                    },
                  },
                }}
                opts={{
                  height: HEIGHT - 20,
                }}
              />
            </div>
          </>
        )}
        <div>
          <h3 className="ml-1 text-[.8rem] font-bold">Temperature Forecast</h3>
          <TemperatureGraph data={chartData} />
        </div>
        <div>
          <h3 className="ml-1 text-[.8rem] font-bold">Wind Forecast</h3>
          {/* <Echarts
            className="max-h-[200px -mt-2"
            option={{
              title: {
                subtext: "Wind forecast for the next 7 days",
                textStyle: {
                  fontSize: ".8rem",
                  fontWeight: "bolder",
                },
                subtextStyle: {
                  fontSize: ".7rem",
                },
              },
              dataset: {
                dimensions: ["name", "minWindSpeed", "maxWindSpeed"],
                source: chartData,
              },
              grid: GRID,
              xAxis: { type: "category" },
              yAxis: { type: "value" },
              series: [
                {
                  type: "line",
                  encode: { x: "name", y: "minWindSpeed" },
                  color: "#f6c244",
                  smooth: true,
                },
                {
                  type: "line",
                  encode: { x: "name", y: "maxWindSpeed" },
                  color: "#f6c244",
                  smooth: true,
                },
              ],
              tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params:unknown) => {
                  const typedParams = params as Params[];
                  const { data } = typedParams[0]!;
                  const unit = units === "metric" ? "kph" : "mph";
                  const windString =
                    data.minWindSpeed === data.maxWindSpeed
                      ? `${data.minWindSpeed} ${unit}`
                      : `${data.minWindSpeed} - ${data.maxWindSpeed} ${unit}`;
                  return (
                    tooltipDiv +
                    `<div  class="text-xs" >Wind Speed on ${data.name}</div>`
                      .replace(/\bon\s+(tonight|today)\b/gi, "$1")
                      .replace(
                        /\bon\s+(This\s+night|evening|morning|Afternoon)\b/gi,
                        "$1"
                      ) +
                    `<div class="font-bold"> ${windString}</div>` +
                    `</div>`
                  );
                },
              },
            }}
            opts={{
              height: HEIGHT - 20,
            }}
          /> */}
          <ForecastWindGraph
            dates={chartData?.map((d) => d.name) ?? []}
            low={chartData?.map((d) => d.minWindSpeed) ?? []}
            high={chartData?.map((d) => d.maxWindSpeed) ?? []}
            gusts={dailyForecast.data?.gusts ?? []}
            setHighlightedPeriod={setHighlightedPeriod}
          />
        </div>
      </div>
      <div>
        <h3 className="mb-2 ml-1 text-[.8rem] font-bold ">Forecast Details</h3>
        <DetailsSection
          data={dailyForecast.data}
          selectedPeriod={highlightedPeriod}
        />
      </div>
    </div>
  );
};

const DetailsSection = React.memo(
  ({
    data,
    selectedPeriod,
  }: {
    data: ReturnType<typeof useDailyForecast>["data"];
    selectedPeriod: number | null;
  }) => {
    return (
      <div className="flex flex-col ">
        {data?.data.map((period, i) => (
          <div
            key={period.name}
            className={twMerge(
              "space-y-1 p-2 transition-all",
              selectedPeriod === i
                ? "scale-105  rounded-md bg-sw-blue-600 text-white"
                : ""
            )}
          >
            <h4 className="text-sm font-semibold flex gap-2 items-center">       <WeatherIcon
              shortForecast={period.shortForecast}
              isDaytime={period.isDaytime}
              size={36}
              className={twMerge(
                "transition-colors",
                selectedPeriod === i ? "text-white" : "text-sw-blue-700"
              )}
            />{period.name}</h4>
     
            <p
              className={twMerge(
                "text-xs text-muted-foreground transition-colors",
                selectedPeriod === i ? "text-white" : ""
              )}
            >
              {period.detailedForecast}
            </p>
          </div>
        ))}
      </div>
    );
  }
);

DetailsSection.displayName = "DetailsSection";
